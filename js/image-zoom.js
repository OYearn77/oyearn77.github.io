// 图片预览功能
window.addEventListener("DOMContentLoaded", function() {
  // 获取文章内容区域的所有图片
  const articleImages = document.querySelectorAll('.markdown-body img');
  
  // 如果页面中有图片，则进行处理
  if (articleImages.length > 0) {
    // 为每个图片添加点击事件
    articleImages.forEach(function(img) {
      // 添加样式使鼠标变为指针，表示可点击
      img.style.cursor = 'zoom-in';
      
      // 创建遮罩层
      let overlay = null;
      
      // 点击图片时的处理函数
      img.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // 如果遮罩层不存在，则创建并显示大图
        if (!overlay) {
          // 创建遮罩层
          overlay = document.createElement('div');
          overlay.className = 'image-zoom-overlay';
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          overlay.style.zIndex = '9999';
          overlay.style.display = 'flex';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          overlay.style.cursor = 'zoom-out';
          
          // 创建大图
          const zoomedImg = document.createElement('img');
          zoomedImg.src = this.src;
          zoomedImg.style.maxWidth = '90%';
          zoomedImg.style.maxHeight = '90%';
          zoomedImg.style.objectFit = 'contain';
          zoomedImg.style.transition = 'transform 0.3s ease';
          
          // 计算原始图片尺寸的150%，同时确保不超过屏幕90%的限制
          const originalWidth = this.width;
          const originalHeight = this.height;
          const targetWidth = originalWidth * 1.2;
          const targetHeight = originalHeight * 1.2;
          const maxWidth = window.innerWidth * 0.9;
          const maxHeight = window.innerHeight * 0.9;
          
          // 根据比例约束设置尺寸
          if (targetWidth <= maxWidth && targetHeight <= maxHeight) {
            // 如果放大后尺寸在允许范围内，直接使用150%大小
            zoomedImg.style.width = targetWidth + 'px';
            zoomedImg.style.height = targetHeight + 'px';
          } else {
            // 否则保持原始比例，但限制在屏幕范围内
            const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
            zoomedImg.style.width = (targetWidth * ratio) + 'px';
            zoomedImg.style.height = (targetHeight * ratio) + 'px';
          }
          
          // 将大图添加到遮罩层
          overlay.appendChild(zoomedImg);
          
          // 将遮罩层添加到body
          document.body.appendChild(overlay);
          
          // 添加点击遮罩层关闭的事件
          overlay.addEventListener('click', function() {
            document.body.removeChild(overlay);
            overlay = null;
          });
          
          // 阻止点击图片时关闭遮罩层
          zoomedImg.addEventListener('click', function(e) {
            e.stopPropagation();
          });
        } else {
          // 如果遮罩层已存在，则关闭它
          document.body.removeChild(overlay);
          overlay = null;
        }
      });
    });
  }
}); 