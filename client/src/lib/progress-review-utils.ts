/**
 * Utility functions for the progress reviews module
 */

/**
 * Get status color based on review status
 */
export function getStatusColor(status: string) {
  switch (status) {
    case 'scheduled':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: 'text-blue-600',
        border: 'border-blue-200'
      };
    case 'in_progress':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        icon: 'text-amber-600',
        border: 'border-amber-200'
      };
    case 'completed':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: 'text-green-600',
        border: 'border-green-200'
      };
    case 'cancelled':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: 'text-red-600',
        border: 'border-red-200'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: 'text-gray-600',
        border: 'border-gray-200'
      };
  }
}

/**
 * Get priority badge color based on action item priority
 */
export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: 'text-red-600',
        border: 'border-red-200'
      };
    case 'medium':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        icon: 'text-amber-600',
        border: 'border-amber-200'
      };
    case 'low':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: 'text-green-600',
        border: 'border-green-200'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: 'text-gray-600',
        border: 'border-gray-200'
      };
  }
}

/**
 * Format rating to stars (★)
 */
export function formatRating(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

/**
 * Get color class for rating
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4) return 'text-green-600';
  if (rating >= 3) return 'text-blue-600';
  if (rating >= 2) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Get default form structure for new templates
 */
export function getDefaultFormStructure() {
  return {
    sections: [
      {
        title: 'Apprentice Competency Assessment',
        description: 'Evaluate the apprentice\'s competency and progress',
        questions: [
          {
            id: `question_${Date.now()}`,
            type: 'rating',
            label: 'Technical Skills',
            description: 'Assessment of technical skills related to their qualification',
            required: true,
          },
          {
            id: `question_${Date.now() + 1}`,
            type: 'rating',
            label: 'Communication',
            description: 'Ability to communicate effectively with team members and clients',
            required: true,
          },
          {
            id: `question_${Date.now() + 2}`,
            type: 'rating',
            label: 'Work Quality',
            description: 'Overall quality of work produced',
            required: true,
          },
          {
            id: `question_${Date.now() + 3}`,
            type: 'textarea',
            label: 'Strengths',
            description: 'Notable strengths demonstrated during this review period',
            required: true,
          },
          {
            id: `question_${Date.now() + 4}`,
            type: 'textarea',
            label: 'Areas for Improvement',
            description: 'Skills or behaviors that need development',
            required: true,
          },
        ],
      },
      {
        title: 'Progress Towards Qualification',
        description: 'Assessment of progress towards completing the qualification',
        questions: [
          {
            id: `question_${Date.now() + 5}`,
            type: 'rating',
            label: 'Overall Progress',
            description: 'Progress towards completing qualification requirements',
            required: true,
          },
          {
            id: `question_${Date.now() + 6}`,
            type: 'textarea',
            label: 'Units Completed',
            description: 'List units of competency completed during this review period',
            required: false,
          },
          {
            id: `question_${Date.now() + 7}`,
            type: 'textarea',
            label: 'Units In Progress',
            description: 'List units of competency currently in progress',
            required: false,
          },
          {
            id: `question_${Date.now() + 8}`,
            type: 'checkbox',
            label: 'On Track for Completion',
            description: 'Is the apprentice on track to complete their qualification within the expected timeframe?',
            required: true,
          },
        ],
      },
    ],
  };
}
