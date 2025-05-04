from pymongo import MongoClient
from datetime import datetime
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = "mongodb+srv://mongodb:mongodb@cluster0.nicfu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGODB_URI)
db = client.findr

# Clear existing data
db.users.delete_many({})
db.matches.delete_many({})
db.swipes.delete_many({})

# Sample user data
users = [
    {
        "email": "alex.tech@example.com",
        "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt()),
        "name": "Alex Chen",
        "school": "MIT",
        "background": "Computer Science major with a focus on AI/ML. Looking for teammates who are passionate about innovative tech solutions.",
        "skills": ["Python", "TensorFlow", "React", "Node.js"],
        "experience": [
            "ML Research Assistant at MIT Lab",
            "Built a real-time object detection system",
            "Led university hackathon team to first place"
        ],
        "tags": ["AI/ML", "Full Stack", "Innovation", "Algorithms"],
        "profile_completed": True,
        "created_at": datetime.utcnow()
    },
    {
        "email": "sarah.design@example.com",
        "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt()),
        "name": "Sarah Wilson",
        "school": "Rhode Island School of Design",
        "background": "UI/UX designer with a passion for creating intuitive user experiences. Seeking developers to bring designs to life.",
        "skills": ["Figma", "Adobe XD", "UI/UX", "Prototyping"],
        "experience": [
            "Design intern at Google",
            "Freelance UI designer for startups",
            "Created design system for university app"
        ],
        "tags": ["Design", "Creative", "User Experience", "Mobile"],
        "profile_completed": True,
        "created_at": datetime.utcnow()
    },
    {
        "email": "mike.dev@example.com",
        "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt()),
        "name": "Mike Johnson",
        "school": "Stanford University",
        "background": "Backend developer specializing in scalable systems. Looking for frontend developers and designers.",
        "skills": ["Java", "Spring Boot", "AWS", "MongoDB"],
        "experience": [
            "Software Engineer at Amazon",
            "Built microservices architecture for startup",
            "Open source contributor to Spring framework"
        ],
        "tags": ["Backend", "Cloud", "Scalability", "DevOps"],
        "profile_completed": True,
        "created_at": datetime.utcnow()
    },
    {
        "email": "emily.product@example.com",
        "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt()),
        "name": "Emily Zhang",
        "school": "UC Berkeley",
        "background": "Product Manager with technical background. Looking for talented developers to build innovative products.",
        "skills": ["Product Strategy", "Agile", "SQL", "Data Analysis"],
        "experience": [
            "PM at Microsoft",
            "Founded tech startup",
            "Led development of enterprise SaaS platform"
        ],
        "tags": ["Product", "Leadership", "Strategy", "Analytics"],
        "profile_completed": True,
        "created_at": datetime.utcnow()
    },
    {
        "email": "david.mobile@example.com",
        "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt()),
        "name": "David Kim",
        "school": "Georgia Tech",
        "background": "Mobile developer with expertise in iOS and Android. Seeking UI/UX designers and backend developers.",
        "skills": ["Swift", "Kotlin", "Flutter", "Firebase"],
        "experience": [
            "iOS Developer at Apple",
            "Created popular fitness tracking app",
            "Mobile development instructor"
        ],
        "tags": ["Mobile", "iOS", "Android", "Cross-platform"],
        "profile_completed": True,
        "created_at": datetime.utcnow()
    },
    {
        "email": "rachel.data@example.com",
        "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt()),
        "name": "Rachel Martinez",
        "school": "Carnegie Mellon University",
        "background": "Data Scientist passionate about ML and AI. Looking for engineers to build intelligent systems.",
        "skills": ["Python", "PyTorch", "SQL", "Data Visualization"],
        "experience": [
            "Data Scientist at Netflix",
            "Built recommendation systems",
            "Published ML research paper"
        ],
        "tags": ["Data Science", "Machine Learning", "Analytics", "Research"],
        "profile_completed": True,
        "created_at": datetime.utcnow()
    },
    {
        "email": "james.security@example.com",
        "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt()),
        "name": "James Thompson",
        "school": "NYU",
        "background": "Cybersecurity specialist focusing on web security. Looking for web developers interested in secure applications.",
        "skills": ["Penetration Testing", "Python", "Network Security", "Cryptography"],
        "experience": [
            "Security Engineer at Microsoft",
            "Bug bounty hunter",
            "Security consultant for startups"
        ],
        "tags": ["Security", "Ethical Hacking", "Web Security", "Privacy"],
        "profile_completed": True,
        "created_at": datetime.utcnow()
    },
    {
        "email": "lisa.frontend@example.com",
        "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt()),
        "name": "Lisa Anderson",
        "school": "University of Washington",
        "background": "Frontend developer specializing in modern web frameworks. Looking for backend developers and designers.",
        "skills": ["React", "Vue.js", "TypeScript", "Tailwind CSS"],
        "experience": [
            "Frontend Engineer at Facebook",
            "Built component library used by 100+ developers",
            "Web accessibility advocate"
        ],
        "tags": ["Frontend", "Web Development", "UI", "Accessibility"],
        "profile_completed": True,
        "created_at": datetime.utcnow()
    },
    {
        "email": "kevin.blockchain@example.com",
        "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt()),
        "name": "Kevin Patel",
        "school": "University of Toronto",
        "background": "Blockchain developer interested in Web3 projects. Seeking full-stack developers and smart contract experts.",
        "skills": ["Solidity", "Web3.js", "Ethereum", "Smart Contracts"],
        "experience": [
            "Smart Contract Developer at ConsenSys",
            "Created DeFi protocol",
            "Blockchain workshop instructor"
        ],
        "tags": ["Blockchain", "Web3", "DeFi", "Cryptocurrency"],
        "profile_completed": True,
        "created_at": datetime.utcnow()
    },
    {
        "email": "nina.game@example.com",
        "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt()),
        "name": "Nina Rodriguez",
        "school": "USC",
        "background": "Game developer with passion for VR/AR. Looking for 3D artists and Unity developers.",
        "skills": ["Unity", "C#", "3D Graphics", "AR/VR Development"],
        "experience": [
            "Game Developer at Riot Games",
            "Published indie game on Steam",
            "VR experience designer"
        ],
        "tags": ["Gaming", "VR/AR", "Unity", "Game Design"],
        "profile_completed": True,
        "created_at": datetime.utcnow()
    }
]

# Insert users into database
result = db.users.insert_many(users)

print(f"✅ Successfully inserted {len(result.inserted_ids)} users")
print("Sample user credentials for testing:")
print("Email: alex.tech@example.com")
print("Password: password123")
print("\nDatabase counts:")
print(f"Users: {db.users.count_documents({})}")
print(f"Matches: {db.matches.count_documents({})}")
print(f"Swipes: {db.swipes.count_documents({})}")

client.close()
