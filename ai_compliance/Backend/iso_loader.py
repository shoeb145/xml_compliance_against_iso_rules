import csv
from pathlib import Path

def load_iso_controls(csv_file: Path):
    """
    Load ISO controls from CSV into a list of dictionaries.
    Only considers first 3 columns: Control ID, Control Name, Control Description
    """
    iso_controls = []

    if not csv_file.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_file}")

    with open(csv_file, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f, quotechar='"')
        headers = next(reader)  # skip header

        for row in reader:
            # Ignore empty rows
            if not row or all(cell.strip() == "" for cell in row):
                continue

            # Take only first 3 columns
            control_id = row[0].strip() if len(row) > 0 else ""
            control_name = row[1].strip() if len(row) > 1 else ""
            control_desc = row[2].strip() if len(row) > 2 else ""

            iso_controls.append({
                "Control ID": control_id,
                "Control Name": control_name,
                "Control Description": control_desc
            })

    print(f"Loaded {len(iso_controls)} ISO controls from {csv_file}")
    return iso_controls

if __name__ == "__main__":
    csv_path = Path("iso_controls.csv")
    controls = load_iso_controls(csv_path)
    for c in controls[:5]:
        print(c)
