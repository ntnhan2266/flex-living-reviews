# Google Reviews Integration - Exploration Report

## Overview
This document explores the feasibility and implementation options for integrating Google Reviews into the Flex Living Reviews Dashboard system.

## Available Google APIs

### 1. Google Places API (Recommended)
**Status**: ✅ Feasible with limitations

**Capabilities**:
- Retrieve basic place information and reviews
- Access up to 5 most recent reviews per place
- Get overall rating and total review count
- Filter by language and sort by relevance/newest

**Limitations**:
- Maximum 5 reviews per location (API restriction)
- Reviews are truncated to 300 characters
- No access to full review history
- Rate limited (monthly quotas apply)

**Implementation Requirements**:
```javascript
// Example API endpoint
GET https://maps.googleapis.com/maps/api/place/details/json
  ?place_id=PLACE_ID
  &fields=reviews,rating,user_ratings_total
  &key=YOUR_API_KEY
```

### 2. Google My Business API (Business Profile API)
**Status**: ❌ Not suitable for this use case

**Reason**: Requires business ownership verification. Only property owners/managers who have claimed their Google Business Profile can access their reviews through this API.

### 3. Web Scraping Solutions
**Status**: ⚠️ Not recommended

**Risks**:
- Violates Google's Terms of Service
- IP blocking and legal issues
- Unreliable due to frequent layout changes
- No official support or guarantees

## Recommended Implementation Strategy

### Phase 1: Basic Integration (MVP)
```javascript
// Backend API route example
app.get('/api/reviews/google/:placeId', async (req, res) => {
  try {
    const placeId = req.params.placeId;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${GOOGLE_API_KEY}`
    );
    
    const data = await response.json();
    
    // Normalize Google reviews to match Hostaway format
    const normalizedReviews = data.result.reviews?.map(review => ({
      id: `google_${review.time}`,
      type: 'guest-review',
      source: 'google',
      rating: review.rating,
      publicReview: review.text,
      submittedAt: new Date(review.time * 1000).toISOString(),
      guestName: review.author_name,
      profilePhoto: review.profile_photo_url
    })) || [];
    
    res.json({
      status: 'success',
      result: normalizedReviews,
      metadata: {
        overallRating: data.result.rating,
        totalReviews: data.result.user_ratings_total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Phase 2: Enhanced Features
- **Place ID Management**: Store Google Place IDs for each property
- **Review Caching**: Cache reviews to minimize API calls
- **Sentiment Analysis**: Add basic sentiment scoring
- **Review Monitoring**: Set up periodic fetching for new reviews

## Data Structure Integration

### Unified Review Schema
```typescript
interface UnifiedReview {
  id: string;
  source: 'hostaway' | 'google' | 'airbnb';
  type: 'guest-review' | 'host-to-guest';
  status: 'published' | 'pending' | 'selected';
  rating: number;
  publicReview: string;
  submittedAt: string;
  guestName: string;
  listingName?: string;
  profilePhoto?: string;
  verified?: boolean;
}
```

## Dashboard Integration

### Manager Dashboard Features
1. **Multi-Source View**: Toggle between Hostaway and Google reviews
2. **Source Indicators**: Visual badges showing review source
3. **Aggregated Metrics**: Combined ratings and trends
4. **Selection Controls**: Approve Google reviews for public display

### UI Components
```jsx
// Review source filter component
const ReviewSourceFilter = () => (
  <div className="filter-group">
    <label>Review Source:</label>
    <select>
      <option value="all">All Sources</option>
      <option value="hostaway">Hostaway</option>
      <option value="google">Google Reviews</option>
    </select>
  </div>
);
```

## Setup Instructions

### 1. Google Cloud Console Setup
1. Create a new project or select existing one
2. Enable the Places API
3. Create API credentials (API Key)
4. Set up API key restrictions for security

### 2. Environment Variables
```env
GOOGLE_PLACES_API_KEY=your_api_key_here
GOOGLE_PLACES_QUOTA_LIMIT=1000  # Monthly request limit
```

### 3. Place ID Discovery
```javascript
// Helper function to find Place ID for properties
const findPlaceId = async (propertyName, address) => {
  const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(propertyName + ' ' + address)}&inputtype=textquery&key=${API_KEY}`;
  // Implementation details...
};
```

## Cost Considerations

### Google Places API Pricing (2024)
- Place Details requests: $17 per 1,000 requests
- Find Place requests: $17 per 1,000 requests
- Free tier: $200 monthly credit (≈11,700 requests)

### Recommended Usage Strategy
- Cache reviews for 24-48 hours
- Implement rate limiting
- Use batch requests where possible
- Monitor API usage through Google Console

## Alternative Solutions

### 1. Third-Party Review Aggregators
- **serpapi**: Google Review API wrapper
- **ReviewTrackers**: Paid service, comprehensive coverage
- **Podium**: Business messaging with review management
- **BirdEye**: Enterprise review management platform

### 2. Manual Import System
- CSV upload functionality for Google Reviews
- Bulk review import with validation
- Manager-controlled review addition

### 3. Widget Integration
- Google Reviews widget embed
- Read-only display on property pages
- No dashboard management needed

## Conclusion

**Recommendation**: Implement Google Places API integration as a supplementary review source with clear limitations communicated to stakeholders.

**Key Benefits**:
- Adds valuable external review perspective
- Relatively simple implementation
- Cost-effective for small to medium scale

**Key Limitations**:
- Limited to 5 most recent reviews per property
- Cannot access full review history
- Requires ongoing API costs
