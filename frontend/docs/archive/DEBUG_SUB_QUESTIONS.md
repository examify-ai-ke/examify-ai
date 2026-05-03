# Debugging Sub-Questions Display Issue

## Steps to Debug

### 1. Open Browser Console
- Open the exam paper edit page: `/dashboard/exam-papers/019ac1f5-d9de-7db3-ae71-426c1eebd1f4/edit`
- Press `F12` to open Developer Tools
- Go to the **Console** tab

### 2. Look for These Log Messages

#### First, check the initial data load:
```
📋 [EDIT PAGE] Raw question sets data:
```
This shows:
- How many question sets were loaded
- For the first set: ID, title, number of questions
- For the first question in that set: whether it has children and how many

**What to look for:**
- `questionsCount` should be > 0
- `hasChildren` should be `true` if there are sub-questions
- `childrenCount` should show the number of sub-questions

#### Second, check the extracted questions:
```
📋 [EDIT PAGE] Extracted questions:
```
This shows:
- Total questions extracted
- How many are main questions (no parent_id)
- How many are sub-questions (have parent_id)
- Sample main question details
- Sample sub-question details

**What to look for:**
- `totalQuestions` should equal main + sub questions
- `mainQuestions` should be > 0
- `subQuestions` should be > 0 if there are sub-questions
- `sampleMainQuestion.question_set_id` should match the question set ID
- `sampleSubQuestion.parent_id` should match a main question ID

#### Third, check the question set display:
```
📋 [QuestionSetDisplay]
```
This shows per question set:
- How many questions are in this set
- How many are main vs sub
- Details about the first main question

**What to look for:**
- `setQuestions` should match the number of questions in that set
- `mainQuestions` should be > 0
- `subQuestions` should be > 0 if there are sub-questions

#### Fourth, check main question processing:
```
📋 [MainQuestion]
```
This shows for each main question:
- Whether it has the `children` property
- How many children it has
- How many sub-questions were found by filtering
- The final count of sub-questions passed to display

**What to look for:**
- `hasChildrenProp` should be `true` if children are preserved
- `childrenPropLength` should match `finalSubQuestionsCount`
- `filteredSubQuestions` should also match if filtering works
- `subQuestionIds` should list the IDs of sub-questions

### 3. Possible Issues and Solutions

#### Issue 1: No sub-questions in raw data
**Log shows:** `childrenCount: 0` in raw data
**Cause:** The API is not returning children in the response
**Solution:** Check the API endpoint `getByExamPaper` to ensure it includes nested children

#### Issue 2: Sub-questions lost during extraction
**Log shows:** Raw data has children, but extracted data shows 0 sub-questions
**Cause:** The extraction logic isn't working correctly
**Solution:** Check if `q.children` is actually an array

#### Issue 3: question_set_id not set
**Log shows:** `sampleMainQuestion.question_set_id` is undefined
**Cause:** The question_set_id wasn't added during extraction
**Solution:** The code should now set this - if still undefined, check the extraction logic

#### Issue 4: Filtering not working
**Log shows:** `filteredSubQuestions: 0` but `childrenPropLength > 0`
**Cause:** The parent_id might not be set correctly on sub-questions
**Solution:** Check that sub-questions have `parent_id` set to the main question's ID

### 4. What Should Happen

When everything works correctly:
1. Raw data shows children in the API response
2. Extracted questions show both main and sub-questions
3. Each question set shows its questions
4. Each main question shows its sub-questions
5. When you expand a main question, sub-questions appear below it

### 5. If Still Not Working

Please share the console output of these logs:
```
📋 [EDIT PAGE] Raw question sets data:
📋 [EDIT PAGE] Extracted questions:
📋 [QuestionSetDisplay]
📋 [MainQuestion]
```

This will help identify exactly where the data is being lost.
