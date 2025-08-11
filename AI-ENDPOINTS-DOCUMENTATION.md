# AI Endpoints Documentation

## Overview

The AI endpoints provide intelligent text processing capabilities for the HRMS Elite system using a local LLM implementation. These endpoints support text summarization, sentiment analysis, keyword extraction, and insights generation.

## Base URL

All AI endpoints are prefixed with `/api/ai` and require authentication.

## Authentication

All endpoints require authentication headers:
- `x-user-role`: User role (e.g., 'company_manager')
- `x-user-id`: User ID

## Endpoints

### 1. Text Summarization

**POST** `/api/ai/summary`

Generates a concise summary of the provided text.

#### Request Body
```json
{
  "text": "النص المراد تلخيصه..."
}
```

#### Response
```json
{
  "summary": "ملخص النص: النص المختصر...",
  "originalLength": 150,
  "summaryLength": 45,
  "compressionRatio": "30.0%"
}
```

#### Error Responses
- `400`: Invalid input or text too short
- `500`: Internal server error
- `503`: AI service not ready

### 2. Sentiment Analysis

**POST** `/api/ai/sentiment`

Analyzes the sentiment of the provided text.

#### Request Body
```json
{
  "text": "النص المراد تحليل مشاعره..."
}
```

#### Response
```json
{
  "sentiment": "positive",
  "confidence": 0.8,
  "textLength": 120
}
```

#### Sentiment Values
- `positive`: إيجابي
- `negative`: سلبي
- `neutral`: محايد

### 3. Keyword Extraction

**POST** `/api/ai/keywords`

Extracts key terms from the provided text.

#### Request Body
```json
{
  "text": "النص المراد استخراج الكلمات المفتاحية منه..."
}
```

#### Response
```json
{
  "keywords": ["موظف", "شركة", "عمل", "إدارة"],
  "count": 4,
  "textLength": 200
}
```

### 4. Insights Generation

**POST** `/api/ai/insights`

Generates insights from provided data.

#### Request Body
```json
{
  "data": {
    "employees": 100,
    "departments": 5,
    "attendance": 95
  }
}
```

#### Response
```json
{
  "insights": [
    "تحليل البيانات يظهر نمواً إيجابياً في معظم المؤشرات",
    "هناك فرص لتحسين الكفاءة في بعض الأقسام",
    "معدل رضا الموظفين مرتفع مما يدل على بيئة عمل جيدة",
    "الحاجة لمراجعة سياسات الغياب والتأخير"
  ],
  "count": 4,
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 5. Comprehensive Analysis

**POST** `/api/ai/analyze`

Performs a complete analysis including summary, sentiment, and keywords.

#### Request Body
```json
{
  "text": "النص المراد تحليله بشكل شامل..."
}
```

#### Response
```json
{
  "summary": "ملخص النص: النص المختصر...",
  "sentiment": "positive",
  "confidence": 0.8,
  "keywords": ["موظف", "شركة", "عمل"],
  "analysis": {
    "originalLength": 300,
    "summaryLength": 90,
    "compressionRatio": "30.0%",
    "keywordCount": 3
  },
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 6. Service Status

**GET** `/api/ai/status`

Checks the status of the AI service.

#### Response
```json
{
  "status": "ready",
  "service": "Local LLM",
  "version": "1.0.0",
  "features": [
    "summary",
    "sentiment", 
    "keywords",
    "insights",
    "comprehensive-analysis"
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Local LLM Implementation

### Features

The LocalLLM class provides the following capabilities:

1. **Text Summarization**: Creates concise summaries while preserving key information
2. **Sentiment Analysis**: Determines emotional tone using Arabic word analysis
3. **Keyword Extraction**: Identifies important terms and concepts
4. **Insights Generation**: Produces actionable insights from data

### Architecture

```typescript
class LocalLLM {
  private model: any;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeModel();
  }

  async generateSummary(text: string): Promise<string>
  async analyzeSentiment(text: string): Promise<{ sentiment: string; confidence: number }>
  async extractKeywords(text: string): Promise<string[]>
  async generateInsights(data: any): Promise<string[]>
}
```

### Error Handling

The implementation includes comprehensive error handling:

- **Service Not Ready**: Returns 503 when LLM is not initialized
- **Invalid Input**: Returns 400 for missing or invalid data
- **Processing Errors**: Returns 500 for internal processing failures

## Usage Examples

### JavaScript/TypeScript

```typescript
// Text summarization
const response = await fetch('/api/ai/summary', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-role': 'company_manager',
    'x-user-id': '1'
  },
  body: JSON.stringify({
    text: 'نص طويل يحتاج إلى تلخيص...'
  })
});

const result = await response.json();
console.log(result.summary);
```

### cURL

```bash
# Generate summary
curl -X POST http://localhost:3000/api/ai/summary \
  -H "Content-Type: application/json" \
  -H "x-user-role: company_manager" \
  -H "x-user-id: 1" \
  -d '{"text": "نص تجريبي للتحليل"}'

# Analyze sentiment
curl -X POST http://localhost:3000/api/ai/sentiment \
  -H "Content-Type: application/json" \
  -H "x-user-role: company_manager" \
  -H "x-user-id: 1" \
  -d '{"text": "نص إيجابي للتحليل"}'
```

## Testing

Run the AI endpoints tests:

```bash
npm test tests/ai-routes.test.ts
```

The test suite covers:
- Valid input processing
- Error handling
- Authentication requirements
- Response format validation

## Future Enhancements

1. **Real Local Model Integration**: Replace mock implementation with actual local LLM
2. **Model Fine-tuning**: Customize models for HR-specific tasks
3. **Batch Processing**: Support for processing multiple texts simultaneously
4. **Caching**: Implement response caching for improved performance
5. **Advanced Analytics**: Add more sophisticated analysis capabilities

## Security Considerations

- All endpoints require authentication
- Input validation prevents malicious requests
- Rate limiting protects against abuse
- Error messages don't expose internal implementation details

## Performance Notes

- Current implementation uses mock processing for demonstration
- Real LLM integration may require additional optimization
- Consider implementing request queuing for high-load scenarios
- Monitor response times and implement caching as needed 