import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ExternalLink, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { SearchService, SearchResult, SearchResponse } from '../services/SearchService';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SearchBoxProps {
  language?: 'zh' | 'en';
  onSearch?: (query: string, results: SearchResponse) => void;
  onInsertResult?: (result: SearchResult) => void;
  onClose?: () => void;
  isFullScreen?: boolean;
  initialQuery?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  language = 'zh',
  onSearch,
  onInsertResult,
  onClose,
  isFullScreen = false,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 加载最近搜索记录
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        const parsed = JSON.parse(savedSearches);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);
  
  // 保存最近搜索记录
  const saveRecentSearch = (query: string) => {
    const newRecentSearches = [
      query,
      ...recentSearches.filter(s => s !== query)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };
  
  // 获取搜索建议
  useEffect(() => {
    if (query.trim().length > 1) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await SearchService.getSuggestions(query, language);
          setSuggestions(suggestions);
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, language]);
  
  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 执行搜索
  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowSuggestions(false);
    
    try {
      const results = await SearchService.search({
        query: searchQuery,
        language,
        maxResults: 10
      });
      
      setSearchResults(results);
      saveRecentSearch(searchQuery);
      
      // 如果有回调，通知父组件
      if (onSearch) {
        onSearch(searchQuery, results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // 清除搜索
  const clearSearch = () => {
    setQuery('');
    setSearchResults(null);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  
  // 处理建议点击
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };
  
  // 处理最近搜索点击
  const handleRecentSearchClick = (recentSearch: string) => {
    setQuery(recentSearch);
    handleSearch(recentSearch);
  };
  
  // 处理插入结果
  const handleInsertResult = (result: SearchResult) => {
    if (onInsertResult) {
      onInsertResult(result);
    }
  };
  
  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        setSelectedResultIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (searchResults && searchResults.results.length > 0) {
        setSelectedResultIndex((prev) => 
          prev < searchResults.results.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (selectedResultIndex >= 0) {
        if (showSuggestions && suggestions[selectedResultIndex]) {
          handleSuggestionClick(suggestions[selectedResultIndex]);
        } else if (searchResults && searchResults.results[selectedResultIndex]) {
          handleInsertResult(searchResults.results[selectedResultIndex]);
        }
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      if (showSuggestions) {
        setShowSuggestions(false);
      } else if (onClose) {
        onClose();
      }
    }
  };
  
  // 渲染搜索建议
  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;
    
    return (
      <div 
        ref={suggestionsRef}
        className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
      >
        <ul className="py-1">
          {suggestions.map((suggestion, index) => (
            <li 
              key={index}
              className={`px-4 py-2 hover:bg-muted cursor-pointer flex items-center ${
                index === selectedResultIndex ? 'bg-muted' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Search className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // 渲染最近搜索
  const renderRecentSearches = () => {
    if (recentSearches.length === 0 || query.trim() || searchResults) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">
          {language === 'zh' ? '最近搜索' : 'Recent Searches'}
        </h3>
        <ul className="space-y-1">
          {recentSearches.map((search, index) => (
            <li key={index}>
              <button
                className="flex items-center text-sm hover:bg-muted px-3 py-2 rounded-md w-full text-left"
                onClick={() => handleRecentSearchClick(search)}
              >
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{search}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // 渲染搜索结果
  const renderSearchResults = () => {
    if (!searchResults) return null;
    
    const { results, totalResults, searchTime, suggestedQueries } = searchResults;
    
    if (results.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {language === 'zh' ? '没有找到相关结果' : 'No results found'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-3 text-sm text-muted-foreground">
          <span>
            {language === 'zh' 
              ? `约 ${totalResults} 条结果 (${searchTime / 1000} 秒)` 
              : `About ${totalResults} results (${searchTime / 1000} seconds)`}
          </span>
        </div>
        
        <div className="space-y-4">
          {results.map((result, index) => (
            <Card 
              key={result.id}
              className={`overflow-hidden border ${
                index === selectedResultIndex ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {result.imageUrl && (
                    <div className="hidden sm:block flex-shrink-0">
                      <ImageWithFallback
                        src={result.imageUrl}
                        alt={result.title}
                        className="w-20 h-20 object-cover rounded-md"
                        width={80}
                        height={80}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-medium truncate">
                          <a 
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-primary"
                          >
                            {result.title}
                          </a>
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{result.source}</span>
                          {result.publishedDate && (
                            <>
                              <span>•</span>
                              <span>{result.publishedDate}</span>
                            </>
                          )}
                          {result.isVerified && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                              {language === 'zh' ? '可信来源' : 'Verified'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title={language === 'zh' ? '在新窗口打开' : 'Open in new window'}
                          onClick={() => window.open(result.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {onInsertResult && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs"
                            onClick={() => handleInsertResult(result)}
                          >
                            {language === 'zh' ? '引用' : 'Cite'}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm mt-2 line-clamp-3">{result.snippet}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {suggestedQueries && suggestedQueries.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">
              {language === 'zh' ? '相关搜索' : 'Related Searches'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((query, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSuggestionClick(query)}
                >
                  {query}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`bg-background ${isFullScreen ? 'h-full overflow-auto' : ''}`}>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.trim() && setSuggestions.length > 0 && setShowSuggestions(true)}
              placeholder={
                language === 'zh'
                  ? '搜索产业集群相关信息...'
                  : 'Search for industry cluster information...'
              }
              className="pl-10"
              autoFocus={isFullScreen}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {language === 'zh' ? '搜索' : 'Search'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              {language === 'zh' ? '关闭' : 'Close'}
            </Button>
          )}
        </div>
        
        {renderSuggestions()}
      </div>
      
      <div className={`mt-4 ${isFullScreen ? 'px-2' : ''}`}>
        {isSearching ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                {language === 'zh' ? '正在搜索...' : 'Searching...'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {renderRecentSearches()}
            {renderSearchResults()}
          </>
        )}
      </div>
    </div>
  );
};