/**
 * Utility functions for color management across the application
 */

/**
 * Get category color for task categories
 */
export const getTaskCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'General': 'bg-gray-100 text-gray-800',
    'Work': 'bg-blue-100 text-blue-800',
    'Personal': 'bg-green-100 text-green-800',
    'Shopping': 'bg-yellow-100 text-yellow-800',
    'Health': 'bg-red-100 text-red-800',
    'Finance': 'bg-purple-100 text-purple-800',
    'Education': 'bg-indigo-100 text-indigo-800',
    'Travel': 'bg-pink-100 text-pink-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

/**
 * Get priority color based on priority level
 */
export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };
  return colors[priority];
};

/**
 * Get achievement category color for gamification
 */
export const getAchievementCategoryColor = (category: string): string => {
  switch (category) {
    case 'productivity':
      return 'from-blue-500 to-blue-600';
    case 'consistency':
      return 'from-green-500 to-green-600';
    case 'milestone':
      return 'from-purple-500 to-purple-600';
    case 'special':
      return 'from-pink-500 to-pink-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};