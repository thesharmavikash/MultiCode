import os
import re

replacements = {
    'DEFAULT_QWEN_FLASH_MODEL': 'DEFAULT_PARAM_FLASH_MODEL',
    'DEFAULT_QWEN_MODEL': 'DEFAULT_PARAM_MODEL',
    'QWEN_CONFIG_DIR': 'PARAM_CONFIG_DIR',
    'convertClaudeToQwenConfig': 'convertClaudeAgentConfig',
    'convertGeminiToQwenConfig': 'convertGeminiToparamConfig',
    'QWEN_OAUTH_MODELS': 'PARAM_OAUTH_MODELS',
    'isQwenQuotaExceededError': 'isProQuotaExceededError',
    'respectQwenIgnore': 'respectParamIgnore',
    'shouldQwenIgnoreFile': 'shouldParamIgnoreFile',
    'useQwenignore': 'useParamIgnore',
    'qwenOAuth2.js': 'paramOAuth2.js',
    'qwenContentGenerator.js': 'paramContentGenerator.js',
    '.qwenignore': '.paramignore',
    '.qwen/': '.param/',
}

root_dir = 'packages/core/src'

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.test.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = new_content.replace(old, new)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {path}')
