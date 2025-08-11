# Training.gov.au (TGA) API Integration

## Overview
Training.gov.au provides access to vocational education and training (VET) information through SOAP-based web services. These services allow access to qualification data, units of competency, and registered training organization information.

## Access Requirements

### Production Access
To request production access to the TGA web services:

1. **Contact the TGA Support Team**: Email the TGA Client Support team at tga@education.gov.au to request web service access.
2. **Complete Application Process**: You'll need to:
   - Provide organization details and justification for API access
   - Sign data access agreements
   - Specify which services you need (Organization, Training Component, etc.)
   - Demonstrate compliance with security requirements

### Sandbox Environment
While awaiting approval, you can use the sandbox environment:
- **URL**: http://tga.hsd.com.au
- **Username**: WebService.Read (case sensitive)
- **Password**: Asdf098 (case sensitive)

This portal contains:
- API specifications
- Data models and definitions
- Sample applications (.NET and Java)
- WSDL files

## Technical Implementation

### Endpoints

#### Sandbox Environment
Base URL: https://ws.sandbox.training.gov.au/Deewr.Tga.Webservices

Service-specific endpoints:
- **TrainingComponentService**: https://ws.sandbox.training.gov.au/Deewr.Tga.WebServices/TrainingComponentService.svc
  - For accessing qualification and unit of competency data
- **OrganisationService**: https://ws.sandbox.training.gov.au/Deewr.Tga.WebServices/OrganisationService.svc
  - For accessing RTO information

### Authentication
- Uses Basic Authentication with username/password
- WSDL access: Append `?wsdl` to service endpoints

### Implementation Considerations
1. **Protocol Compatibility**: Ensure your client supports SOAP 1.1/1.2 and WS-Security
2. **Cross-domain Limitations**: Implement server-side proxies if accessing from browser applications
3. **Rate Limitations**: Be aware of usage quotas and rate limits 

## Data Types

### Key Entities

1. **Qualifications**
   - Code, title, description
   - AQF level, training package
   - Release information, status (active/superseded)

2. **Units of Competency**
   - Code, title, description
   - Elements and performance criteria
   - Release information, status (active/superseded)

3. **Registered Training Organizations (RTOs)**
   - RTO code and details
   - Scope of registration
   - Training locations

## Implementation Best Practices

1. **Caching**: Implement caching to reduce API calls, as qualification and unit data doesn't change frequently
2. **Error Handling**: Implement robust error handling and retry logic
3. **Security**: Store credentials securely and use environment variables
4. **Data Sync**: Consider periodic synchronization to maintain a local database of commonly used entities

## Application Endpoints

The application exposes a REST endpoint that proxies qualification search to the TGA API:

- `GET /api/tga/search?q=<query>&limit=<n>&includeSuperseded=true|false`
  - `includeSuperseded` is optional and when `true` also returns superseded qualifications

## Support Resources

For technical issues or additional information:
- TGA Help Desk: tga@education.gov.au
- Technical documentation available through the sandbox portal