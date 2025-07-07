(function() {
  // 获取URL中的搜索关键词
  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === variable) {
        return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
      }
    }
    return '';
  }

  // 加载搜索索引
  function loadIndex(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/content.json', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var searchData = JSON.parse(xhr.responseText);
        callback(searchData);
      }
    };
    xhr.send();
  }

  // 提取中文关键词（简单实现）
  function extractKeywords(text) {
    if (!text) return [];
    
    // 预定义的停用词列表（可以根据需要扩展）
    var stopWords = ['的', '了', '和', '是', '在', '我', '有', '个', '与', '这', '那', '你', '们', '就', '都'];
    
    // 中文分词（简单实现，使用正则表达式分割单字和词语）
    // 注意：实际应用中应使用专业的分词库，这里只是简化实现
    var words = [];
    
    // 先尝试按空格分词（处理已经分好的词或英文单词）
    var spaceWords = text.trim().toLowerCase().split(/\s+/);
    
    spaceWords.forEach(function(word) {
      // 对中文进行进一步分词（假设每个汉字都可能是一个词）
      if (/[\u4e00-\u9fa5]/.test(word)) {
        // 提取2-3个字的词组（简化版，实际上需要更复杂的分词算法）
        for (var i = 0; i < word.length; i++) {
          // 单字
          if (!stopWords.includes(word[i])) {
            words.push(word[i]);
          }
          
          // 双字词
          if (i < word.length - 1) {
            var twoChars = word.substring(i, i + 2);
            if (!stopWords.includes(twoChars)) {
              words.push(twoChars);
            }
          }
          
          // 三字词
          if (i < word.length - 2) {
            var threeChars = word.substring(i, i + 3);
            if (!stopWords.includes(threeChars)) {
              words.push(threeChars);
            }
          }
        }
      } else {
        // 非中文词直接添加
        if (word && !stopWords.includes(word)) {
          words.push(word);
        }
      }
    });
    
    // 去重
    return [...new Set(words)];
  }

  // 计算相关度得分
  function calculateRelevance(post, keywords) {
    var score = 0;
    var titleWeight = 3;    // 标题匹配权重
    var tagWeight = 2;      // 标签匹配权重
    var categoryWeight = 2; // 分类匹配权重
    var contentWeight = 1;  // 内容匹配权重
    
    var titleLower = post.title.toLowerCase();
    var contentLower = post.content ? post.content.toLowerCase() : '';
    
    // 计算每个关键词的得分并累加
    keywords.forEach(function(keyword) {
      // 标题匹配
      if (titleLower.indexOf(keyword) > -1) {
        score += titleWeight;
      }
      
      // 标签匹配
      if (post.tags && post.tags.length > 0) {
        for (var i = 0; i < post.tags.length; i++) {
          if (post.tags[i].name.toLowerCase().indexOf(keyword) > -1) {
            score += tagWeight;
            break;
          }
        }
      }
      
      // 分类匹配
      if (post.categories && post.categories.length > 0) {
        for (var i = 0; i < post.categories.length; i++) {
          if (post.categories[i].name.toLowerCase().indexOf(keyword) > -1) {
            score += categoryWeight;
            break;
          }
        }
      }
      
      // 内容匹配（标题权重较高）
      if (contentLower.indexOf(keyword) > -1) {
        var count = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
        score += Math.min(count, 5) * contentWeight; // 限制最大匹配次数
      }
    });
    
    return score;
  }

  // 搜索函数
  function search(keyword, data) {
    if (!keyword) return [];
    
    keyword = keyword.trim().toLowerCase();
    
    // 提取关键词
    var keywords = extractKeywords(keyword);
    if (keywords.length === 0) {
      keywords = [keyword]; // 如果没有提取出关键词，则使用原始输入
    }
    
    console.log('提取的关键词：', keywords);
    
    var results = [];
    var posts = data.posts;
    var resultMap = new Map(); // 用于去重和记录得分

    // 对每篇文章，计算与所有关键词的匹配度
    posts.forEach(function(post) {
      var relevance = calculateRelevance(post, keywords);
      
      // 只有相关度大于0的文章才添加到结果中
      if (relevance > 0) {
        // 添加相关度得分
        post.relevance = relevance;
        resultMap.set(post.path, post);
      }
    });
    
    // 转换Map为数组并按相关度排序
    results = Array.from(resultMap.values());
    results.sort(function(a, b) {
      return b.relevance - a.relevance;
    });
    
    return results;
  }

  // 显示搜索结果
  function displayResults(results, keyword) {
    var searchResultContainer = document.getElementById('search-result');
    var noResultContainer = document.getElementById('no-result');
    var searchKeywordContainer = document.getElementById('search-keyword');
    var searchCountContainer = document.getElementById('search-count');
    
    // 显示搜索关键词
    searchKeywordContainer.textContent = keyword;
    
    // 如果没有结果，显示无结果提示
    if (results.length === 0) {
      searchResultContainer.style.display = 'none';
      noResultContainer.style.display = 'block';
      searchCountContainer.textContent = '(0 条结果)';
      return;
    }

    // 计算最高相关度
    var maxRelevance = Math.max(...results.map(post => post.relevance));
    var threshold = maxRelevance / 6;

    // 过滤掉低于阈值的结果
    var filteredResults = results.filter(post => post.relevance >= threshold);
    
    // 显示过滤后的结果数量
    searchCountContainer.textContent = '(' + filteredResults.length + ' 条结果)';
    
    // 显示搜索结果
    searchResultContainer.style.display = 'block';
    noResultContainer.style.display = 'none';
    
    var html = '';
    filteredResults.forEach(function(post) {
      html += '<div class="article-item layout-padding">';
      html += '<article class="card-container article-card content-padding--large soft-size--large soft-style--box">';
      
      // 封面图
      if (post.cover) {
        html += '<div class="card-cover" style="background-image: url(' + post.cover + ')"></div>';
      }
      
      // 文章信息区域
      html += '<div class="card-text">';
      
      // 标题
      if (post.link) {
        html += '<a href="' + post.link + '" itemprop="url" target="_blank">';
        html += '<h2 class="card-text--title">' + post.title + '</h2>';
        html += '</a>';
      } else {
        html += '<a href="/' + post.path + '" itemprop="url">';
        html += '<h2 class="card-text--title">' + post.title + '</h2>';
        html += '</a>';
      }
      
      // 发布日期
      html += '<div class="card-text--row">';
      html += '<span>发布于</span>';
      html += '<time>' + new Date(post.date).toLocaleDateString() + '</time>';
      html += '</div>';
      
      // 相关度显示（可选）
      html += '<div class="card-text--row relevance">';
      html += '<span>相关度: ' + post.relevance + '</span>';
      html += '</div>';
      
      // 分类
      if (post.categories && post.categories.length > 0) {
        html += '<ul class="wrap-list ' + (post.cover ? 'dark' : 'light') + '">';
        post.categories.forEach(function(category) {
          html += '<li><a href="/categories/' + category.slug + '/">📒 ' + category.name + '</a></li>';
        });
        html += '</ul>';
      }
      
      // 标签
      if (post.tags && post.tags.length > 0) {
        html += '<ul class="wrap-list ' + (post.cover ? 'dark' : 'light') + '">';
        post.tags.forEach(function(tag) {
          html += '<li><a href="/tags/' + tag.slug + '/">🏷️ ' + tag.name + '</a></li>';
        });
        html += '</ul>';
      }
      
      html += '</div>'; // 关闭 card-text
      html += '</article>'; // 关闭 article
      html += '</div>'; // 关闭 article-item
    });
    
    searchResultContainer.innerHTML = html;
  }

  // 主函数
  function init() {
    var keyword = getQueryVariable('q');
    if (!keyword) {
      return;
    }
    
    document.title = '搜索：' + keyword + ' - ' + document.title;
    
    loadIndex(function(data) {
      var results = search(keyword, data);
      displayResults(results, keyword);
    });
  }

  // 页面加载完成后执行
  document.addEventListener('DOMContentLoaded', init);
})(); 