# Mono-v-Micro

## Technologies 🛠️

### Backend
- Node.js with TypeScript
- Express.js as framework
- Concurrent.js for managing multiple services
- Axios for inter-service communication
- CORS for handling cross-origin requests

### Frontend
- React 18
- TypeScript
- Vite as bundler
- ESLint for static code analysis

## Installation and Launch 🚀

### Prerequisites
- Node.js (LTS version)
- npm (Node.js package manager)

### Installation

1. Clone the repository:
```bash
git clone [repository-address]
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Launch

1. Run backend (in backend directory):
```bash
npm start
```
This will start all services:
- Main server
- Monolithic service
- Microservices (orders, preparation, delivery)

2. Run frontend (in frontend directory):
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## About the Project - Monolithic vs Microservices Proof of Concept State
An educational project showcasing the differences between monolithic and microservices architecture using two restaurants as examples.

### Concept
We compare two restaurant management models:

#### 1. Monolithic Restaurant 🍝
- One owner performing all operations
- Taking orders
- Preparing meals
- Processing payments
- Serving orders

#### 2. Microservices Restaurant 🍽️
- Different employees responsible for specific stages
- Waiter taking orders
- Chef preparing meals
- Cashier handling payments
- Person serving orders

### Key Differences

#### Failure Handling ⚡
- **Monolith**: Failure of one component (e.g., payment terminal) stops the entire operation
- **Microservices**: Failure of one component doesn't affect other processes

#### Performance 🚀
- **Monolith**: 
  - Efficient for single orders
  - May have issues with a larger number of concurrent orders
- **Microservices**:
  - Better scalability with a high number of concurrent orders
  - Each process can be optimized independently

### Next Steps

#### Technical 🛠️
- Add comprehensive testing suite (unit, integration)
- Implement multiple backend instances to better simulate monolithic architecture limitations
- Backend refactoring following Separation of Concerns principles
  - Service layer extraction
  - Repository pattern implementation
  - Code organization improvements
- 

#### New Features 🎯
- AI Chatbot for user interaction
  - Answering questions about application architecture
  - Explaining differences between monolithic and microservices approaches
  - Knowledge base built on project documentation and reliable sources
- Order processing cost system
  - Single operation cost simulation
  - Cost efficiency comparison between architectures
- User control panel
  - Component failure simulation capabilities
  - Service scaling controls
  - Performance impact visualization

#### Deployment 🚀
- Application deployment
  - Hosting platform selection
  - Production environment configuration
  - CI/CD setup
  - Monitoring and analytics
  - Environment variables setup (.env)
  - UI cleanup and responsive design implementation



## Project Goal
Demonstration of advantages and disadvantages of both architectures in an accessible way, helpful in understanding architectural concepts in programming.

## Status
Project under development. Currently implemented features:
- Failure simulation in both architectures
- Performance comparison under different loads