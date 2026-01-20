export const applyFilters = (data, filters) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.entries(filters).every(([field, filter]) => {
        const value = item[field];

        if (value == null) {
          return false;
        }

        switch (filter.type) {
          case 'range':
            return applyRangeFilter(value, filter);

          case 'select':
            return applySelectFilter(value, filter);

          case 'date':
            return applyDateFilter(value, filter);

          default:
            return true;
        }
      });
    });
  };

  const applyRangeFilter = (value, filter) => {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return false;
    }

    const min = filter.min != null ? parseFloat(filter.min) : -Infinity;
    const max = filter.max != null ? parseFloat(filter.max) : Infinity;

    return numValue >= min && numValue <= max;
  };

  const applySelectFilter = (value, filter) => {
    if (!filter.values || filter.values.length === 0) {
      return true;
    }

    return filter.values.includes(value);
  };

  const applyDateFilter = (value, filter) => {
    try {
      const date = new Date(value);

      if (isNaN(date.getTime())) {
        return false;
      }

      const fromDate = filter.from ? new Date(filter.from) : new Date(-8640000000000000);
      const toDate = filter.to ? new Date(filter.to) : new Date(8640000000000000);

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      return date >= fromDate && date <= toDate;
    } catch (error) {
      return false;
    }
  };

  export const getFilterStats = (originalCount, filteredCount) => {
    const percentage = originalCount > 0
      ? Math.round((filteredCount / originalCount) * 100)
      : 0;

    return {
      originalCount,
      filteredCount,
      percentage,
      isFiltered: originalCount !== filteredCount
    };
  };

  export const hasActiveFilters = (filters) => {
    if (!filters || typeof filters !== 'object') {
      return false;
    }

    return Object.keys(filters).length > 0;
  };

  export default applyFilters;
