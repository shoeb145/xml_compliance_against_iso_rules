import asyncio
import json
import time
import os
from dotenv import load_dotenv
from openai import OpenAI
from tasks_progress import update_task_progress, finish_task, fail_task
load_dotenv()

# --- OpenAI setup ---
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # <-- Replace with your API key

# --- AI call helper ---
async def ai_json_call(messages, model="gpt-4o-mini"):
    def blocking_call():
        return client.chat.completions.create(
            model=model,
            messages=messages,
            response_format={"type": "json_object"}
        )

    response = await asyncio.to_thread(blocking_call)
    content = response.choices[0].message.content
    return json.loads(content)

# --- Process single ISO rule ---
async def process_rule(rule_text, json_data, rule_index, total_rules, task_id):
    # Update progress before starting this rule
    progress = int((rule_index / total_rules) * 100)
    update_task_progress(task_id, progress, rule_text.split(':')[1].strip() if ':' in rule_text else rule_text[:50], f"Processing rule {rule_index + 1} of {total_rules}")
    
    # Step 1: Relevance + keyword extraction
    messages = [
        {"role": "system", "content": "You are an ISO compliance expert specializing in Palo Alto Networks firewall configurations."},
        {"role": "user", "content": f"Rule: {rule_text}\nDecide if this rule is relevant to firewall XML configs. "
                                    f"If yes, return JSON with keys: is_relevant (true/false), suggested_keywords (list). "
                                    f"If not relevant, set is_relevant false."}
    ]
    relevance_json = await ai_json_call(messages)

    if not relevance_json.get("is_relevant", False):
        return {
            "status": "non-relevant",
            "reasoning": "Rule not relevant to XML configuration.",
            "evidence": []
        }

    # Step 2: Keyword search in JSON
    keywords = relevance_json.get("suggested_keywords", [])
    snippets = []
    for k in keywords:
        for entry in json_data:
            combined_text = (entry.get("path","") + " " + str(entry.get("value",""))).lower()
            if k.lower() in combined_text:
                snippets.append(entry)

    if not snippets:
        return {
            "status": "non-compliant",
            "reasoning": "No evidence found in XML for this rule.",
            "evidence": []
        }

    # Step 3: Compliance check with evidence
    messages = [
        {"role": "system", "content": "You are a cybersecurity compliance auditor. Evaluate if the provided configuration snippets demonstrate compliance with the ISO control. Provide reasoning for both compliant and non-compliant results."},
        {"role": "user", "content": f"ISO Control: {rule_text}\n\nFirewall Configuration Evidence:\n{json.dumps(snippets[:5], indent=2)}\n\n"
                                    f"Analyze compliance and return JSON with: compliance_status ('compliant'|'non-compliant'), "
                                    f"reasoning (detailed explanation), key_evidence (most relevant snippets)."}
    ]
    compliance_json = await ai_json_call(messages)

    return {
        "status": compliance_json.get("compliance_status", "non-compliant"),
        "reasoning": compliance_json.get("reasoning", "No reasoning provided"),
        "evidence": snippets[:3]  # Return top 3 most relevant pieces of evidence
    }

# --- Main async function ---
async def run_compliance(iso_rules, json_data, task_id):
    start_time = time.time()
    
    final_compliant = []
    final_non_compliant = []

    total_rules = len(iso_rules)
    
    # Process all rules
    for idx, control in enumerate(iso_rules):
        rule_text = f"{control.get('Control ID', '')}: {control.get('Control Name', '')} - {control.get('Control Description', '')}"
        
        try:
            result = await process_rule(rule_text, json_data, idx, total_rules, task_id)

            entry = {
                "control_id": control.get("Control ID", ""),
                "control_name": control.get("Control Name", ""),
                "control_description": control.get("Control Description", ""),
                "status": result["status"].capitalize(),
                "reasoning": result.get("reasoning", ""),
                "evidence": result.get("evidence", [])
            }

            if result["status"] == "compliant":
                final_compliant.append(entry)
            else:
                final_non_compliant.append(entry)
                
        except Exception as e:
            # If a rule fails, continue with others but log the error
            print(f"Error processing rule {control.get('Control ID', '')}: {e}")
            continue

    # --- Summary ---
    total_time = round(time.time() - start_time, 2)

    summary = {
        "time_taken_sec": total_time,
        "total_rules": total_rules,
        "compliant_rules": len(final_compliant),
        "non_compliant_rules": len(final_non_compliant),
        "compliance_score": round((len(final_compliant) / total_rules) * 100, 2) if total_rules else 0
    }

    final_output = {
        "summary": summary,
        "results": {
            "compliant": final_compliant,
            "non_compliant": final_non_compliant
        }
    }

    # Mark task as completed
    finish_task(task_id, final_output)
    
    return final_output