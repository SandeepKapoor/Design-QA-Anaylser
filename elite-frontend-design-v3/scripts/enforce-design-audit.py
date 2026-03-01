BANNED_FONTS = ["Inter", "Roboto", "Arial"]

def audit_code(code):
    issues = []
    for font in BANNED_FONTS:
        if font in code:
            issues.append(f"Banned font detected: {font}")
    return issues

if __name__ == "__main__":
    print("Design audit module loaded.")
