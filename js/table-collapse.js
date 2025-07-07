// 表格展开/压缩功能
(function() {
    'use strict';
    
    function initTableCollapse() {
        // 查找所有表格
        const tables = document.querySelectorAll('.markdown-body table');
        
        tables.forEach(function(table) {
            // 避免重复处理
            if (table.hasAttribute('data-collapse-processed')) {
                return;
            }
            table.setAttribute('data-collapse-processed', 'true');
            
            const tbody = table.querySelector('tbody');
            if (!tbody) return;
            
            const rows = tbody.querySelectorAll('tr');
            
            // 只处理超过8行的表格
            if (rows.length <= 8) return;
            
            // 创建表格容器
            const tableContainer = document.createElement('div');
            tableContainer.className = 'table-container';
            
            // 将表格包装在容器中
            table.parentNode.insertBefore(tableContainer, table);
            tableContainer.appendChild(table);
            
            // 添加collapsed类，初始状态为收起
            table.classList.add('table-collapsed');
            
            // 隐藏第9行及以后的行
            for (let i = 8; i < rows.length; i++) {
                rows[i].classList.add('table-row-hidden');
            }
            
            // 创建展开/收起按钮
            const toggleButton = document.createElement('button');
            toggleButton.className = 'table-toggle-btn';
            toggleButton.innerHTML = `
                <span class="toggle-text">展开表格</span>
                <span class="toggle-icon">▼</span>
            `;
            
            // 创建行数提示
            const rowInfo = document.createElement('span');
            rowInfo.className = 'table-row-info';
            rowInfo.textContent = `(显示 8 / ${rows.length} 行)`;
            
            // 创建按钮容器
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'table-controls';
            buttonContainer.appendChild(toggleButton);
            buttonContainer.appendChild(rowInfo);
            
            // 将按钮添加到表格后面
            tableContainer.appendChild(buttonContainer);
            
            // 添加点击事件
            toggleButton.addEventListener('click', function() {
                const isCollapsed = table.classList.contains('table-collapsed');
                
                if (isCollapsed) {
                    // 展开表格
                    table.classList.remove('table-collapsed');
                    for (let i = 8; i < rows.length; i++) {
                        rows[i].classList.remove('table-row-hidden');
                    }
                    toggleButton.querySelector('.toggle-text').textContent = '收起表格';
                    toggleButton.querySelector('.toggle-icon').textContent = '▲';
                    rowInfo.textContent = `(显示 ${rows.length} / ${rows.length} 行)`;
                } else {
                    // 收起表格
                    table.classList.add('table-collapsed');
                    for (let i = 8; i < rows.length; i++) {
                        rows[i].classList.add('table-row-hidden');
                    }
                    toggleButton.querySelector('.toggle-text').textContent = '展开表格';
                    toggleButton.querySelector('.toggle-icon').textContent = '▼';
                    rowInfo.textContent = `(显示 8 / ${rows.length} 行)`;
                }
            });
        });
    }
    
    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTableCollapse);
    } else {
        initTableCollapse();
    }
    
    // 监听动态添加的表格
    const observer = new MutationObserver(function(mutations) {
        let shouldCheck = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldCheck = true;
            }
        });
        
        if (shouldCheck) {
            setTimeout(initTableCollapse, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})(); 