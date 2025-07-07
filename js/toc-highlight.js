/**
 * 完整的TOC高亮和滚动脚本
 * 支持中文和英文标题，修复点击中文目录项无法滚动的问题
 */
document.addEventListener('DOMContentLoaded', function() {
    // 获取TOC容器和所有TOC链接
    const tocContainer = document.querySelector('.widget-toc .widget-body');
    if (!tocContainer) return; // 如果没有TOC则退出
    
    const tocLinks = Array.from(tocContainer.querySelectorAll('a'));
    if (tocLinks.length === 0) return; // 如果没有TOC链接则退出
    
    // 获取文章中的所有标题
    const headings = Array.from(document.querySelectorAll('.article-entry h1, .article-entry h2, .article-entry h3, .article-entry h4, .article-entry h5, .article-entry h6'));
    if (headings.length === 0) return; // 如果没有标题则退出
    
    // 排序标题（按照它们在页面中的位置）
    headings.sort((a, b) => {
      return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
    });
    
    // 假设TOC链接的顺序与页面中标题的顺序一致
    // 如果标题和TOC链接数量不一致，使用最小值
    const minLength = Math.min(headings.length, tocLinks.length);
    
    // 创建双向映射（页面标题索引 -> TOC链接 和 TOC链接 -> 页面标题）
    const positionMap = {};
    const linkToHeading = new Map();
    
    for (let i = 0; i < minLength; i++) {
      positionMap[i] = tocLinks[i];
      linkToHeading.set(tocLinks[i], headings[i]);
    }
    
    // 滚动TOC容器以确保活动链接可见
    const scrollTocToActiveLink = (activeLink) => {
      if (!activeLink) return;
      
      // 获取TOC容器的可视区域
      const containerRect = tocContainer.getBoundingClientRect();
      const containerHeight = containerRect.height;
      
      // 获取活动链接的位置
      const linkRect = activeLink.getBoundingClientRect();
      const linkTop = linkRect.top - containerRect.top; // 相对于容器的顶部位置
      const linkBottom = linkTop + linkRect.height;
      
      // 判断活动链接是否在可视区域内
      const isVisible = (linkTop >= 0) && (linkBottom <= containerHeight);
      
      if (!isVisible) {
        // 如果不在可视区域内，滚动使其可见
        // 滚动到链接在容器中间的位置
        const scrollTop = linkTop - (containerHeight / 2) + (linkRect.height / 2);
        tocContainer.scrollTop = tocContainer.scrollTop + scrollTop;
      }
    };
    
    // 跟踪上一个激活的链接，防止不必要的跳转
    let lastActiveLink = null;
    
    // 添加高亮样式并滚动TOC
    const highlightTocLink = (link) => {
      // 如果链接没有变化，不做任何操作
      if (link === lastActiveLink) return;
      
      // 移除所有链接的高亮样式
      tocLinks.forEach(link => {
        link.classList.remove('toc-active');
      });
      
      // 为当前链接添加高亮样式
      if (link) {
        link.classList.add('toc-active');
        scrollTocToActiveLink(link);
        lastActiveLink = link;
      }
    };
    
    // 判断当前可见的标题
    const updateActiveTocLink = () => {
      // 获取当前滚动位置（添加小偏移量以提前触发）
      // 使用与点击滚动相同的偏移量，确保一致性
      const headerOffset = 200;
      const scrollPosition = window.scrollY + headerOffset;
      
      // 检查页面是否已经滚动到底部或接近底部
      const isNearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50;
      
      if (isNearBottom && minLength > 0) {
        // 如果接近底部，始终高亮最后一个标题
        highlightTocLink(positionMap[minLength - 1]);
        return;
      }
      
      // 查找当前滚动位置上方的最后一个标题
      let activeHeadingIndex = -1;
      
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i];
        const headingTop = heading.getBoundingClientRect().top + window.scrollY;
        
        if (headingTop <= scrollPosition) {
          activeHeadingIndex = i;
        } else {
          // 一旦超过当前滚动位置就停止
          break;
        }
      }
      
      // 如果找到了激活的标题
      if (activeHeadingIndex >= 0 && positionMap[activeHeadingIndex]) {
        highlightTocLink(positionMap[activeHeadingIndex]);
      } else if (tocLinks.length > 0 && !lastActiveLink) {
        // 只有在没有上一个激活链接的情况下才高亮第一个链接（初始状态）
        highlightTocLink(tocLinks[0]);
      }
    };
    
    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = `
      .widget-toc .widget-body .toc-active {
        color: var(--theme-text-active) !important;
        font-weight: bold;
      }
      
      /* 确保TOC容器可滚动 */
      .widget-toc .widget-body {
        overflow-y: auto;
        scroll-behavior: smooth; /* 添加平滑滚动效果 */
      }
    `;
    document.head.appendChild(style);
    
    // 使用节流优化滚动性能
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateActiveTocLink();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // 初始调用以设置当前活动标题
    updateActiveTocLink();
    
    // 为TOC链接添加点击事件，实现平滑滚动到对应标题
    tocLinks.forEach((link, index) => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        
        // 使用我们之前建立的映射获取对应的标题元素
        const targetHeading = linkToHeading.get(this);
        
        if (targetHeading) {
          // 计算页面顶部固定元素的高度（如导航栏）
          // 默认设置为60px，可根据您网站的实际情况调整
          const headerOffset = 60;
          
          // 平滑滚动到目标标题位置，确保标题刚好位于顶部导航栏下方
          window.scrollTo({
            top: targetHeading.getBoundingClientRect().top + window.scrollY - headerOffset,
            behavior: 'smooth'
          });
          
          // 立即高亮相应的TOC链接
          highlightTocLink(this);
        } else {
          // 如果没有找到映射的标题，尝试通过href查找（兼容处理）
          const href = this.getAttribute('href');
          if (!href || !href.startsWith('#')) return;
          
          const targetId = href.substring(1);
          const fallbackHeading = document.getElementById(targetId);
          
          if (fallbackHeading) {
            // 保持与上面相同的偏移量，确保一致性
            const headerOffset = 60;
            
            window.scrollTo({
              top: fallbackHeading.getBoundingClientRect().top + window.scrollY - headerOffset,
              behavior: 'smooth'
            });
            
            highlightTocLink(this);
          }
        }
      });
    });
  });