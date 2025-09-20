from pathlib import Path
import xml.etree.ElementTree as ET
from collections import defaultdict
import json

# --- Recursive XML Parsing ---
def parse_element(element, parent_path="", context=None):
    if context is None:
        context = {}

    entries = []
    path = f"{parent_path}/{element.tag}" if parent_path else element.tag

    # Track "name" attribute if exists
    name_attr = element.attrib.get('name', '')
    if name_attr:
        context[element.tag.lower()] = name_attr
        path_with_name = f"{path}[@name='{name_attr}']"
    else:
        path_with_name = path

    # Attributes
    for attr_name, attr_value in element.attrib.items():
        entries.append({
            "path": f"{path_with_name}/@{attr_name}",
            "value": attr_value.strip(),
            "context": context.copy()
        })

    # Text content
    text = (element.text or "").strip()
    if text:
        entries.append({
            "path": path_with_name,
            "value": text,
            "context": context.copy()
        })

    # Recursive children
    for child in element:
        entries.extend(parse_element(child, path_with_name, context.copy()))

    return entries

# --- Grouping based on keywords ---
def group_sections(entries):
    groups = defaultdict(list)

    group_keywords = {
        'security_rules': ['rule', 'security'],
        'address_objects': ['address', 'address-object'],
        'service_objects': ['service'],
        'applications': ['application'],
        'application_groups': ['application-group'],
        'profile_groups': ['profile-group'],
        'profiles': ['profile'],
        'nat_rules': ['nat', 'nat-rule'],
        'template_stack': ['template-stack'],
        'devices': ['device'],
        'vsys': ['vsys'],
        'zones': ['zone'],
        'interfaces': ['interface'],
        'log_forwarding': ['log-forwarding']
    }

    for entry in entries:
        assigned = False
        entry_text = entry['value'].lower()
        entry_path = entry['path'].lower()

        for group_name, keywords in group_keywords.items():
            for kw in keywords:
                if kw in entry_path or kw in entry_text:
                    groups[group_name].append(entry)
                    assigned = True
                    break
            if assigned:
                break

        if not assigned:
            groups['other'].append(entry)

    return groups

# --- Parse from file path ---
def parse_xml(file_path: Path):
    tree = ET.parse(file_path)
    root = tree.getroot()
    entries = parse_element(root)
    grouped = group_sections(entries)

    # Print counts
    total_entries = 0
    print("Parsed XML entries by group:")
    for key, val in grouped.items():
        print(f"{key}: {len(val)} entries")
        total_entries += len(val)
    print(f"Total entries parsed: {total_entries}")

    return grouped

# --- Parse from string content ---
def parse_xml_from_string(xml_content: str):
    root = ET.fromstring(xml_content)
    entries = parse_element(root)
    grouped = group_sections(entries)

    # Print counts
    total_entries = 0
    print("Parsed XML entries by group:")
    for key, val in grouped.items():
        print(f"{key}: {len(val)} entries")
        total_entries += len(val)
    print(f"Total entries parsed: {total_entries}")

    return grouped

# --- Test script ---
# if __name__ == "__main__":
#     INPUT_XML = Path(r"C:\Macsofy\xml_compliance_against_iso_rules\ai_compliance\Backend\Firewall_configuration.xml")
#     OUTPUT_JSON = Path(r"C:\Users\shren\Downloads\proj_\47365738465hfbvdfv.json")
#     grouped_data = parse_xml(INPUT_XML)