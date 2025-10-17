// src/Homepage/Links/Developers.jsx
import { useState } from "react";
import { ArrowLeft, Github, Mail, ExternalLink, Code, Palette, FileText, Users } from "lucide-react";
import { Link } from "react-router-dom";

function Developers() {
  const [activeMember, setActiveMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: "Alex Rodriguez",
      role: "Lead Developer",
      icon: Code,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      description: "Full-stack developer specializing in React and Node.js. Responsible for system architecture and core functionality implementation.",
      skills: ["React", "Node.js", "MongoDB", "Express", "API Design"],
      github: "https://github.com/alexrodriguez",
      email: "alex.rodriguez@usa.edu.ph",
      portfolio: "https://alexrodriguez.dev"
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "UI/UX Designer",
      icon: Palette,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
      description: "Creative designer focused on user experience and interface design. Ensures the application is intuitive and visually appealing.",
      skills: ["Figma", "UI/UX Design", "Prototyping", "User Research", "Wireframing"],
      github: "https://github.com/sarahchen",
      email: "sarah.chen@usa.edu.ph",
      portfolio: "https://sarahchen.design"
    },
    {
      id: 3,
      name: "Marcus Thompson",
      role: "Documentation Specialist",
      icon: FileText,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      description: "Technical writer and documentation expert. Creates comprehensive user guides and system documentation.",
      skills: ["Technical Writing", "Documentation", "User Manuals", "API Docs", "Markdown"],
      github: "https://github.com/marcusthompson",
      email: "marcus.thompson@usa.edu.ph",
      portfolio: "https://marcusthompson.write"
    },
    {
      id: 4,
      name: "Elena Martinez",
      role: "Project Manager",
      icon: Users,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      description: "Project coordinator ensuring timely delivery and team collaboration. Manages project timelines and stakeholder communication.",
      skills: ["Agile Methodology", "Project Planning", "Team Coordination", "Risk Management", "Scrum"],
      github: "https://github.com/elenamartinez",
      email: "elena.martinez@usa.edu.ph",
      portfolio: "https://elenamartinez.pm"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Development Team
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the talented BSIT 4A - Group 4 team behind CircuLink. 
              We're passionate about creating innovative solutions for the Augustinian community.
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {teamMembers.map((member) => {
            const IconComponent = member.icon;
            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => setActiveMember(member)}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                      <div className="flex items-center gap-2 text-amber-600">
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm font-medium">{member.role}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              BSIT 4A - Group 4
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
              We are a dedicated team of fourth-year BS Information Technology students from the 
              University of San Agustin. CircuLink represents our commitment to solving real-world 
              problems through technology and innovation. Our diverse skills and collaborative 
              approach ensure we deliver a high-quality library room reservation system that 
              serves the needs of the Augustinian community.
            </p>
          </div>
        </div>

        {/* Member Detail Modal */}
        {activeMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={activeMember.image}
                    alt={activeMember.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-amber-400"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{activeMember.name}</h3>
                    <div className="flex items-center gap-2 text-amber-600">
                      <activeMember.icon className="w-5 h-5" />
                      <span className="font-medium">{activeMember.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveMember(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {activeMember.description}
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeMember.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={activeMember.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-300 flex-1 justify-center"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                  <a
                    href={`mailto:${activeMember.email}`}
                    className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-300 flex-1 justify-center"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                  <a
                    href={activeMember.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex-1 justify-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Portfolio
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Developers;