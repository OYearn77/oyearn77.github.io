// 代码块模组，支持复制整个代码与识别代码类型
document.addEventListener('DOMContentLoaded', function() {
  // 查找所有代码块
  const codeBlocks = document.querySelectorAll('figure.highlight');
  
  codeBlocks.forEach(function(block, i) {
    // 尝试获取语言信息
    let languageName = "code";
    
    // 方法1: 从class中获取语言
    const classes = block.className.split(' ');
    for (const cls of classes) {
      if (cls.startsWith('language-')) {
        languageName = cls.replace('language-', '');
        break;
      }
    }
    
    // 方法2: 从内部代码元素获取语言
    if (languageName === "code") {
      const codeElement = block.querySelector('code');
      if (codeElement && codeElement.className) {
        const codeClasses = codeElement.className.split(' ');
        for (const cls of codeClasses) {
          if (cls.startsWith('language-')) {
            languageName = cls.replace('language-', '');
            break;
          }
        }
      }
    }
    
    // 方法3: 尝试从figcaption获取语言
    const figcaption = block.querySelector('figcaption');
    if (figcaption && languageName === "code") {
      languageName = figcaption.textContent.trim();
    }
    
    // 方法4: 从代码内容尝试检测语言
    if (languageName === "code") {
      const codeText = block.textContent || '';
      
      // 检测C/C++语言代码
      if ((codeText.includes('#include <') || 
          /\bmain\s*\([^\)]*\)\s*\{/.test(codeText) ||
          /#define\s+\w+/.test(codeText) ||
          /\bstd::\w+/.test(codeText) ||
          /\bconst\s+\w+[\s\*]+\w+/.test(codeText) ||
          /\btypedef\s+\w+/.test(codeText) ||
          /\b(char|int|float|double|void|unsigned|long|struct|union)\s+[\*\s]*\w+/.test(codeText)) &&
          !codeText.includes('console.log') && 
          !codeText.includes('document.') && 
          !codeText.includes('import ') && 
          !codeText.includes('function ')) {
        
        // 区分C和C++
        if (codeText.includes('std::') || 
            codeText.includes('namespace') || 
            codeText.includes('template') || 
            codeText.includes('class ') || 
            codeText.includes('new ') || 
            codeText.includes('delete ') ||
            codeText.includes('->') ||
            codeText.includes('<<') || 
            codeText.includes('>>') ||
            codeText.includes('::')) {
          languageName = 'cpp';
        } else {
          languageName = 'c';
        }
      }
      // 检测C#代码
      else if (/using\s+System;/.test(codeText) || 
               /namespace\s+\w+/.test(codeText) && codeText.includes('{') || 
               /public\s+class\s+\w+/.test(codeText) && codeText.includes('{') ||
               /\bstring\[\]\s+args/.test(codeText) ||
               /Console\.Write(Line)?\(/.test(codeText) ||
               /\bdouble\s+\w+\s*=/.test(codeText) && codeText.includes(';')) {
        languageName = 'csharp';
      }
      // 检测MATLAB代码
      else if (/function\s+(\[[\w\s,]+\]\s*=\s*)?[\w\d_]+\(.*\)/.test(codeText) || 
              /^\s*%.*/.test(codeText) ||
              /end(\s*%.*)?$/.test(codeText) ||
              /\b(plot|figure|subplot|xlabel|ylabel|title|xlim|ylim|hold|grid|axis|legend)\s*\(/.test(codeText) ||
              /^\s*for\s+\w+\s*=/.test(codeText) && !codeText.includes('{') ||
              /\bdisp\s*\(/.test(codeText)) {
        languageName = 'matlab';
      }
      // 检测Java代码
      else if ((/public\s+(static\s+)?(final\s+)?(class|interface|enum)\s+\w+/.test(codeText) || 
          /\@Override/.test(codeText) ||
          /\bimport\s+java\./.test(codeText) ||
          /\bextends\s+\w+/.test(codeText) ||
          /\bimplements\s+\w+/.test(codeText) ||
          /\bnew\s+\w+\s*\(/.test(codeText) ||
          /public\s+(static\s+)?(final\s+)?\w+(\[\])?\s+\w+\s*\(/.test(codeText)) &&
          !codeText.includes('func ') && 
          !codeText.includes('let ') && 
          !codeText.includes('var ') && 
          !codeText.includes('const ')) {
        languageName = 'java';
      }
      // 检测Python代码
      else if ((/\bdef\s+\w+\s*\(.*\)\s*:/.test(codeText) || 
               /\bimport\s+\w+/.test(codeText) && !codeText.includes('{') && !codeText.includes(';') ||
               /\bfrom\s+\w+\s+import\s+/.test(codeText) ||
               /\bclass\s+\w+(\s*\(\s*\w+\s*\))?\s*:/.test(codeText) ||
               /\bif\s+.*\s*:/.test(codeText) && !codeText.includes('{') ||
               /\bfor\s+\w+\s+in\s+/.test(codeText) ||
               /\bprint\s*\(.*\)/.test(codeText) ||
               /\bwith\s+\w+\s+as\s+\w+\s*:/.test(codeText))) {
        languageName = 'python';
      }
      // 检测JavaScript/TypeScript代码
      else if ((/\bfunction\s+\w+\s*\(/.test(codeText) || 
               /\bconst\s+\w+\s*=/.test(codeText) || 
               /\blet\s+\w+\s*=/.test(codeText) ||
               /\bvar\s+\w+\s*=/.test(codeText) ||
               /=>\s*{/.test(codeText) ||
               /\bdocument\./.test(codeText) ||
               /\bconsole\.log/.test(codeText) ||
               /\bwindow\./.test(codeText) ||
               /\$\(.*\)\./.test(codeText) ||
               /new\s+Promise\s*\(/.test(codeText) ||
               /\basync\s+function/.test(codeText) ||
               /\bawait\s+/.test(codeText)) &&
               !codeText.includes('func ') &&
               !codeText.includes('package ')) {
        
        // 区分JS和TS
        if (codeText.includes(':') && 
            (/:\s*(string|number|boolean|any|void|null|undefined|never)\b/.test(codeText) ||
             /interface\s+\w+/.test(codeText) ||
             /type\s+\w+\s*=/.test(codeText) ||
             /<\w+>\(/.test(codeText) ||
             /\w+<\w+>/.test(codeText) ||
             /\bimport\s+{\s*\w+\s*}\s+from\s+/.test(codeText))) {
          languageName = 'typescript';
        } else {
          languageName = 'javascript';
        }
      }
      // 检测HTML代码
      else if ((/<(!DOCTYPE|html|head|body|div|span|p|a|img|ul|ol|li|table|form|input|button|h[1-6]|meta|link|script|style)/.test(codeText) &&
               />[^<]*<\//.test(codeText)) ||
               /<!DOCTYPE\s+html>/i.test(codeText)) {
        languageName = 'html';
      }
      // 检测CSS代码
      else if ((/[\.\#\*]\w+[\-\w]*\s*{/.test(codeText) || 
               /@(media|keyframes|import|font-face|supports)\s/.test(codeText) ||
               /\b(margin|padding|font-size|color|background|display|position|width|height|border|text-align|line-height|box-shadow|transform|transition|animation)\s*:/.test(codeText)) &&
               !codeText.includes('function') &&
               !codeText.includes('class') && 
               !codeText.includes('if') && 
               !codeText.includes('else')) {
        languageName = 'css';
      }
      // 检测PHP代码
      else if (/(<\?php|\?>)/.test(codeText) || 
               /\$\w+\s*=/.test(codeText) && codeText.includes(';') ||
               /echo\s+["']/.test(codeText) ||
               /\bfunction\s+\w+\s*\([^\)]*\)\s*{/.test(codeText) && codeText.includes('$')) {
        languageName = 'php';
      }
      // 检测SQL代码
      else if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|BEGIN|COMMIT|ROLLBACK)\b/i.test(codeText) && 
               (/\bFROM\b/i.test(codeText) || 
                /\bTABLE\b/i.test(codeText) || 
                /\bWHERE\b/i.test(codeText) || 
                /\bORDER BY\b/i.test(codeText) || 
                /\bGROUP BY\b/i.test(codeText) ||
                /\bVALUES\s*\(/i.test(codeText))) {
        languageName = 'sql';
      }
      // 检测Go代码
      else if ((/package\s+\w+/.test(codeText) && 
               (/func\s+\w+\s*\(/.test(codeText) || 
                /import\s+\(/.test(codeText) ||
                /var\s+\(\s*\w+\s+\w+/.test(codeText) || 
                /const\s+\(/.test(codeText))) ||
               /\bfunc\s+\(\w+\s+\*?\w+\)\s+\w+\s*\(/.test(codeText)) {
        languageName = 'go';
      }
      // 检测Rust代码
      else if (/fn\s+\w+\s*\(/.test(codeText) || 
               /let\s+mut\s+\w+/.test(codeText) ||
               /pub\s+struct\s+\w+/.test(codeText) ||
               /impl\s+\w+\s+for\s+\w+/.test(codeText) ||
               /\buse\s+std::/.test(codeText) ||
               /match\s+\w+\s+{/.test(codeText) ||
               /\bRust\b/.test(codeText)) {
        languageName = 'rust';
      }
      // 检测Ruby代码
      else if ((/\bdef\s+\w+/.test(codeText) && !codeText.includes(':')) ||
               /\bclass\s+\w+\b/.test(codeText) && /\bend\b/.test(codeText) ||
               /\bmodule\s+\w+\b/.test(codeText) && /\bend\b/.test(codeText) ||
               /\brequire\s+['"]/.test(codeText) ||
               /\battr_accessor\b/.test(codeText) ||
               /@\w+\s*=/.test(codeText) ||
               /\bRuby\b/.test(codeText)) {
        languageName = 'ruby';
      }
      // 检测Shell/Bash代码
      else if ((/^\s*#!\/bin\/(ba)?sh/.test(codeText) || 
               /^\s*#\s*shell script/.test(codeText) ||
               /\becho\s+["']/.test(codeText) && !codeText.includes(';') ||
               /\bexport\s+\w+=/.test(codeText) ||
               /\bif\s+\[\s+/.test(codeText) || 
               /\bfor\s+\w+\s+in\s+/.test(codeText) && codeText.includes('do') ||
               /\bwhile\s+\[\s+/.test(codeText) ||
               /\$\(\w+\)/.test(codeText) ||
               /\${/.test(codeText) ||
               codeText.includes('#!/bin/bash')) &&
               !codeText.includes('function')) {
        languageName = 'bash';
      }
      // 检测JSON数据
      else if (/^\s*{[\s\S]*"[\w\s]+"\s*:[\s\S]*}\s*$/.test(codeText) && 
               !codeText.includes('function') && 
               !codeText.includes('var') && 
               !codeText.includes('class')) {
        languageName = 'json';
      }
      // 检测XML数据
      else if (/<\?xml\s+version=["'][^"']+["']\s+encoding=["'][^"']+["']\?>/.test(codeText) ||
               (/<\w+[^>]*>[\s\S]*<\/\w+>/.test(codeText) && 
                !codeText.includes('<html') && 
                !codeText.includes('<body') && 
                !codeText.includes('<div'))) {
        languageName = 'xml';
      }
      // 检测YAML数据
      else if ((codeText.includes(': ') && !codeText.includes('{') && !codeText.includes(';')) ||
               /^\s*[\w\-]+:\s*\w+/.test(codeText) ||
               /^\s*\-\s+[\w\-]+:\s/.test(codeText) ||
               /^\s*\-\s+\w+/.test(codeText) && codeText.includes(':') ||
               /^\s*---\s*$/.test(codeText) ||
               (/[\w\-]+:\s*$/.test(codeText) && /^\s+[\w\-]+:/.test(codeText)) ||
               (/^\s*[\w\-]+:\s+[|>]/.test(codeText)) ||
               (/^\s*\w+:\s*\n\s+- /.test(codeText))) {
        languageName = 'yaml';
      }
    }
    
    // 创建包装容器
    const wrapper = document.createElement('div');
    wrapper.className = 'highlight-wrapper';
    
    // 创建代码头部
    const header = document.createElement('div');
    header.className = 'code-header';
    
    // 添加语言标签
    const language = document.createElement('span');
    language.className = 'code-language';
    language.textContent = languageName;
    header.appendChild(language);
    
    // 添加复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.setAttribute('data-clipboard-target', `#code-${i}`);
    copyButton.innerHTML = '<svg class="copy-icon" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg>复制';
    header.appendChild(copyButton);
    
    // 添加内容容器
    const content = document.createElement('div');
    content.className = 'code-content';
    
    // 将原始代码块移动到content中
    content.appendChild(block.cloneNode(true));
    
    // 给代码内容添加ID
    const codeElement = content.querySelector('table') || content.querySelector('pre') || content.querySelector('code');
    if (codeElement) {
      codeElement.id = `code-${i}`;
    }
    
    // 将新元素添加到包装器中
    wrapper.appendChild(header);
    wrapper.appendChild(content);
    
    // 替换原始代码块
    block.parentNode.replaceChild(wrapper, block);
  });
  
  // 初始化复制功能
  if (typeof ClipboardJS !== 'undefined') {
    const clipboard = new ClipboardJS('.copy-button');
    
    clipboard.on('success', function(e) {
      const original = e.trigger.innerHTML;
      // 双对勾图标 SVG + 已复制文本
      const successIcon = '<svg class="success-icon" viewBox="0 0 16 16" fill="#4caf50" style="width: 16px; height: 16px; margin-right: 4px;"><path d="M8.97 4.97a.75.75 0 011.07 1.05l-3.99 4.99a.75.75 0 01-1.08.02L2.324 8.384a.75.75 0 111.06-1.06l2.094 2.093L8.95 4.992a.252.252 0 01.02-.022zm-.92 5.14l.92.92a.75.75 0 001.079-.02l3.992-4.99a.75.75 0 10-1.091-1.028L9.477 9.417l-.485-.486-.943 1.179z"></path></svg>';
      e.trigger.innerHTML = successIcon + '已复制';
      setTimeout(function() {
        e.trigger.innerHTML = original;
      }, 2000);
      e.clearSelection();
    });
    
    clipboard.on('error', function(e) {
      const original = e.trigger.innerHTML;
      // 错误图标 SVG + 复制失败文本
      const errorIcon = '<svg class="error-icon" viewBox="0 0 16 16" fill="#f44336" style="width: 16px; height: 16px; margin-right: 4px;"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14.4c-3.5 0-6.4-2.9-6.4-6.4S4.5 1.6 8 1.6s6.4 2.9 6.4 6.4-2.9 6.4-6.4 6.4zm3.2-8L8 9.6 4.8 6.4 3.6 7.6 6.8 10.8 3.6 14l1.2 1.2L8 12l3.2 3.2 1.2-1.2-3.2-3.2 3.2-3.2-1.2-1.2z"></path></svg>';
      e.trigger.innerHTML = errorIcon + '复制失败';
      setTimeout(function() {
        e.trigger.innerHTML = original;
      }, 2000);
    });
  } else {
    console.error('ClipboardJS 未加载，复制功能将不可用');
  }
});

