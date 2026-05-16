import sys

file_path = "d:\\zee\\frontend\\app\\(dashboard)\\project\\page.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
for i, line in enumerate(lines):
    # Detect the line 538 closing ReactMarkdown
    if i == 537 and "</ReactMarkdown>" in line:
        output.append("                             </ReactMarkdown>\n")
        output.append("                          </div>\n")
        output.append("                       </div>\n")
        # We'll skip the next few lines that are redundant
        continue
    if i in [538, 539, 540, 541]:
        # Skip these lines as they had the redundant div
        continue
    
    # Normally we copy
    output.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(output)
