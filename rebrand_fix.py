import os
import re

replacements = [
    (r'DEFAULT_param_MODEL', 'DEFAULT_PARAM_MODEL'),
    (r'DEFAULT_param_FLASH_MODEL', 'DEFAULT_PARAM_FLASH_MODEL'),
    (r'DEFAULT_param_EMBEDDING_MODEL', 'DEFAULT_PARAM_EMBEDDING_MODEL'),
    (r'param_OAUTH', 'PARAM_OAUTH'),
    (r'AuthType\.QWEN_OAUTH', 'AuthType.PARAM_OAUTH'),
    (r'AuthType\.param_OAUTH', 'AuthType.PARAM_OAUTH'),
    (r'respectparamIgnore', 'respectParamIgnore'),
    (r'shouldparamIgnoreFile', 'shouldParamIgnoreFile'),
    (r'QWEN_DIR', 'PARAM_DIR'),
    (r'param_DIR', 'PARAM_DIR'),
    (r'getGlobalQwenDir', 'getGlobalParamDir'),
    (r'getGlobalparamDir', 'getGlobalParamDir'),
    (r'getparamDir', 'getParamDir'),
    (r'QwenLogger', 'ParamLogger'),
    (r'qwenIgnoreParser', 'paramIgnoreParser'),
    (r'QwenIgnoreParser', 'ParamIgnoreParser'),
    (r'param_RUNTIME_DIR', 'PARAM_RUNTIME_DIR'),
    (r'isparamQuotaExceededError', 'isParamQuotaExceededError'),
]

paths = [
    'packages/core/src',
    'packages/cli/src'
]

for base_path in paths:
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith(('.ts', '.js', '.tsx', '.jsx', '.json')):
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
