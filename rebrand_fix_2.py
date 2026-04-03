import os
import re

replacements = [
    (r'QwenOAuthProgress', 'ParamOAuthProgress'),
    (r'useQwenAuth', 'useParamAuth'),
    (r'qwen-light', 'param-light'),
    (r'qwen-dark', 'param-dark'),
    (r'qwenIgnoreParser', 'paramIgnoreParser'),
    (r'QwenIgnoreParser', 'ParamIgnoreParser'),
    (r'QWEN\.md', 'PARAM.md'),
    (r'qwen-extension\.json', 'param-extension.json'),
]

paths = [
    'packages/core/src',
    'packages/cli/src'
]

for base_path in paths:
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith(('.ts', '.js', '.tsx', '.jsx', '.json', '.md')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for old, new in replacements:
                    new_content = re.sub(old, new, new_content)
                
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {file_path}")
