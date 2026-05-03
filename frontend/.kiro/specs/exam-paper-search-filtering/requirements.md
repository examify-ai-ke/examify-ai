# Requirements Document

## Introduction

This document outlines the requirements for implementing comprehensive search and filtering functionality for exam papers in the Exampapel frontend application. Currently, the exam papers browse page (`/exampapers`) has non-functional search and filtering capabilities. This feature will integrate with the existing backend API endpoints to provide users with powerful search and filtering tools to find relevant exam papers quickly.

## Requirements

### Requirement 1: Text Search Functionality

**User Story:** As a student, I want to search for exam papers by typing keywords, so that I can quickly find papers related to specific topics or courses.

#### Acceptance Criteria

1. WHEN a user types a search query in the search box THEN the system SHALL perform a full-text search across exam paper identifying names, course names, institution names, exam descriptions, titles, and tags
2. WHEN search results are returned THEN the system SHALL display matching exam papers with relevance-based sorting by default
3. WHEN a user clears the search query THEN the system SHALL reset to showing all exam papers
4. WHEN a search query is entered THEN the system SHALL update the URL query parameters to maintain search state
5. WHEN a user shares a URL with search parameters THEN the system SHALL restore the search state from the URL

### Requirement 2: Institution Filtering

**User Story:** As a student, I want to filter exam papers by institution, so that I can focus on papers from my university or specific institutions.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL fetch and display a list of available institutions in the filter sidebar
2. WHEN a user selects one or more institutions THEN the system SHALL filter exam papers to show only those from the selected institutions
3. WHEN a user deselects an institution THEN the system SHALL update the results to exclude papers from that institution
4. WHEN institution filters are applied THEN the system SHALL display the count of selected filters
5. WHEN a user clicks "Clear Filters" THEN the system SHALL remove all institution filters

### Requirement 3: Year Filtering

**User Story:** As a student, I want to filter exam papers by year, so that I can practice with recent papers or review historical trends.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL display available exam years in the filter sidebar
2. WHEN a user selects one or more years THEN the system SHALL filter exam papers to show only those from the selected years
3. WHEN year filters are applied THEN the system SHALL sort years in descending order (most recent first)
4. WHEN a user deselects a year THEN the system SHALL update the results accordingly
5. WHEN no papers exist for a year THEN the system SHALL NOT display that year as a filter option

### Requirement 4: Course Filtering

**User Story:** As a student, I want to filter exam papers by course, so that I can find papers for specific subjects I'm studying.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL fetch and display available courses in the filter sidebar
2. WHEN a user selects one or more courses THEN the system SHALL filter exam papers to show only those for the selected courses
3. WHEN course filters are applied THEN the system SHALL display the course name or code
4. WHEN a user searches within courses THEN the system SHALL filter the course list based on the search term
5. WHEN a user deselects a course THEN the system SHALL update the results to exclude papers from that course

### Requirement 5: Duration Range Filtering

**User Story:** As a student, I want to filter exam papers by duration, so that I can practice with papers that match my available study time.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL display duration range filter controls (min and max sliders or inputs)
2. WHEN a user sets a minimum duration THEN the system SHALL filter papers to show only those with duration >= minimum
3. WHEN a user sets a maximum duration THEN the system SHALL filter papers to show only those with duration <= maximum
4. WHEN both min and max are set THEN the system SHALL filter papers within the specified range
5. WHEN duration filters are cleared THEN the system SHALL show papers of all durations

### Requirement 6: Tag-Based Filtering

**User Story:** As a student, I want to filter exam papers by tags, so that I can find papers related to specific topics or categories.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL display available tags in the filter sidebar
2. WHEN a user selects one or more tags THEN the system SHALL filter exam papers to show only those with the selected tags
3. WHEN multiple tags are selected THEN the system SHALL show papers that match ANY of the selected tags (OR logic)
4. WHEN a user deselects a tag THEN the system SHALL update the results accordingly
5. WHEN tags are applied THEN the system SHALL display the count of active tag filters

### Requirement 7: Date Range Filtering

**User Story:** As a student, I want to filter exam papers by exam date range, so that I can find papers from specific time periods.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL display date range filter controls (from and to date pickers)
2. WHEN a user sets a "from" date THEN the system SHALL filter papers to show only those with exam_date >= from date
3. WHEN a user sets a "to" date THEN the system SHALL filter papers to show only those with exam_date <= to date
4. WHEN both dates are set THEN the system SHALL filter papers within the specified date range
5. WHEN date filters are cleared THEN the system SHALL show papers from all dates

### Requirement 8: Sorting Options

**User Story:** As a student, I want to sort exam papers by different criteria, so that I can view papers in my preferred order.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL display sorting options (relevance, date, duration, title)
2. WHEN a user selects "relevance" sort THEN the system SHALL sort papers by search relevance score (only when search query is active)
3. WHEN a user selects "date" sort THEN the system SHALL sort papers by exam date
4. WHEN a user selects "duration" sort THEN the system SHALL sort papers by exam duration
5. WHEN a user selects "title" sort THEN the system SHALL sort papers alphabetically by identifying name
6. WHEN a sort option is selected THEN the system SHALL allow toggling between ascending and descending order

### Requirement 9: Filter State Persistence

**User Story:** As a student, I want my filter selections to persist in the URL, so that I can bookmark or share specific filtered views.

#### Acceptance Criteria

1. WHEN filters are applied THEN the system SHALL update the URL query parameters to reflect all active filters
2. WHEN a user navigates back/forward THEN the system SHALL restore filter state from the URL
3. WHEN a user shares a URL with filters THEN the recipient SHALL see the same filtered results
4. WHEN the page loads with URL parameters THEN the system SHALL apply those filters automatically
5. WHEN filters are cleared THEN the system SHALL remove filter parameters from the URL

### Requirement 10: Loading and Empty States

**User Story:** As a student, I want clear feedback when searching and filtering, so that I understand what's happening and when no results are found.

#### Acceptance Criteria

1. WHEN filters are being applied THEN the system SHALL display a loading indicator
2. WHEN no papers match the filters THEN the system SHALL display a "No results found" message
3. WHEN no results are found THEN the system SHALL suggest clearing filters or adjusting search criteria
4. WHEN the API request fails THEN the system SHALL display an error message with retry option
5. WHEN filters are loading THEN the system SHALL disable filter controls to prevent conflicts

### Requirement 11: Mobile-Responsive Filtering

**User Story:** As a student using a mobile device, I want to access filtering options easily, so that I can search for papers on any device.

#### Acceptance Criteria

1. WHEN viewing on mobile THEN the system SHALL display a "Filters" button to open a filter drawer
2. WHEN the filter drawer is opened THEN the system SHALL display all filter options in a scrollable panel
3. WHEN filters are applied on mobile THEN the system SHALL show an "Apply Filters" button
4. WHEN the user clicks "Apply Filters" THEN the system SHALL close the drawer and update results
5. WHEN filters are active on mobile THEN the system SHALL display a badge count on the "Filters" button

### Requirement 12: Filter Counts and Availability

**User Story:** As a student, I want to see how many papers match each filter option, so that I can make informed filtering decisions.

#### Acceptance Criteria

1. WHEN filter options are displayed THEN the system SHALL show the count of papers for each option
2. WHEN filters are applied THEN the system SHALL update counts to reflect available papers with current filters
3. WHEN a filter option has zero papers THEN the system SHALL either hide it or disable it
4. WHEN hovering over a filter option THEN the system SHALL show a tooltip with additional information
5. WHEN multiple filters are active THEN the system SHALL show the total count of matching papers
