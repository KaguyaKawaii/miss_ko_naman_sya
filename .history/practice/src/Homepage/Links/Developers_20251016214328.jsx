// src/Homepage/Links/Developers.jsx
import { useState } from "react";
import { Github, Mail, ExternalLink, Code, Palette, FileText, Users, X, Star, Zap, Cpu, Rocket, Sparkles, Target, Shield, Globe, Database, Smartphone, Cloud, Server, Cogs, Lightbulb } from "lucide-react";

function Developers() {
  const [activeMember, setActiveMember] = useState(null);
  const [imageError, setImageError] = useState({});

  const handleImageError = (id) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  // Fallback component for missing images
  const FallbackAvatar = ({ name, className = "w-full h-full" }) => (
    <div className={`bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold ${className}`}>
      {name.split(' ').map(n => n[0]).join('')}
    </div>
  );

  const teamMembers = [
    {
      id: 1,
      name: "Stephen Madero Jr.",
      role: "Full Stack Developer",
      icon: Code,
      image: null, // Set to null to trigger fallback initially
      description: "Senior full-stack developer specializing in modern web technologies. Architect of CircuLink's core infrastructure with expertise in scalable systems and real-time applications. Passionate about clean code, performance optimization, and cutting-edge technologies.",
      detailedBio: "With over 3 years of experience in web development, Stephen leads the technical implementation of CircuLink. His expertise spans across the entire stack, from designing robust backend APIs to creating responsive frontend interfaces. He's passionate about software architecture and mentoring fellow developers.",
      skills: ["React", "Node.js", "TypeScript", "MongoDB", "Express", "GraphQL", "AWS", "Docker", "Redis", "WebSockets"],
      techStack: ["Frontend: React, Redux, Tailwind CSS", "Backend: Node.js, Express, Socket.io", "Database: MongoDB, Redis", "DevOps: Docker, AWS, CI/CD"],
      achievements: ["Led development of 10+ successful projects", "Optimized application performance by 300%", "Mentored 15+ junior developers"],
      github: "https://github.com/stephenmadero",
      email: "stephen.madero@usa.edu.ph",
      portfolio: "https://stephenmadero.dev",
      personality: ["Innovative", "Problem Solver", "Mentor", "Tech Enthusiast"],
      availability: "Available for collaborations"
    },
    {
      id: 2,
      name: "Patrick Miguel Andrade",
      role: "Project Manager & Strategist",
      icon: Users,
      image: null,
      description: "Strategic project leader with exceptional organizational skills and a proven track record in agile project management. Expert in resource allocation, timeline management, and stakeholder communication.",
      detailedBio: "Patrick brings structured leadership to the CircuLink project, ensuring all team members are aligned and productive. With certifications in Agile methodologies, he efficiently manages project timelines, resources, and stakeholder expectations while maintaining team morale and focus.",
      skills: ["Agile Methodology", "Scrum Master", "Project Planning", "Risk Management", "Team Leadership", "Stakeholder Communication", "Resource Allocation", "JIRA", "Confluence"],
      techStack: ["Project Management: JIRA, Trello, Asana", "Communication: Slack, Microsoft Teams", "Documentation: Confluence, Notion"],
      achievements: ["Managed 20+ successful project deliveries", "Improved team productivity by 40%", "Reduced project risks by 60%"],
      github: "https://github.com/patrickandrade",
      email: "patrick.andrade@usa.edu.ph",
      portfolio: "https://patrickandrade.pm",
      personality: ["Leader", "Organized", "Strategic", "Communicative"],
      availability: "Open for project consultations"
    },
    {
      id: 3,
      name: "Louis Miguel Parenno",
      role: "UI/UX Design Lead",
      icon: Palette,
      image: null,
      description: "Creative design lead with a keen eye for aesthetics and user experience. Specializes in creating intuitive, accessible, and visually stunning interfaces that enhance user engagement and satisfaction.",
      detailedBio: "Louis combines artistic vision with user-centered design principles to create exceptional digital experiences. His design process involves extensive user research, prototyping, and usability testing to ensure CircuLink provides an intuitive and enjoyable experience for all users.",
      skills: ["Figma", "Adobe Creative Suite", "UI/UX Design", "User Research", "Prototyping", "Wireframing", "Design Systems", "Accessibility", "Motion Design"],
      techStack: ["Design: Figma, Adobe XD, Illustrator", "Prototyping: Framer, Principle", "Research: UserTesting, Hotjar"],
      achievements: ["Designed 50+ successful interfaces", "Improved user engagement by 200%", "Created 3 design systems"],
      github: "https://github.com/louisparenno",
      email: "louis.parenno@usa.edu.ph",
      portfolio: "https://louisparenno.design",
      personality: ["Creative", "Empathetic", "Detail-Oriented", "Innovative"],
      availability: "Available for design projects"
    },
    {
      id: 4,
      name: "Suheila Belle Morales",
      role: "Documentation & Technical Writer",
      icon: FileText,
      image: null,
      description: "Expert technical writer specializing in creating comprehensive, clear, and user-friendly documentation. Ensures complex technical concepts are accessible to all users through well-structured guides and manuals.",
      detailedBio: "Suheila plays a crucial role in making CircuLink accessible to all users through exceptional documentation. She translates complex technical processes into easy-to-understand guides, creates comprehensive API documentation, and ensures all team knowledge is properly documented and maintained.",
      skills: ["Technical Writing", "API Documentation", "User Guides", "Content Strategy", "Markdown", "GitBook", "Information Architecture", "Quality Assurance"],
      techStack: ["Documentation: GitBook, Confluence, Notion", "Writing: Grammarly, Hemingway", "Version Control: Git, GitHub"],
      achievements: ["Wrote 100+ technical documents", "Reduced support tickets by 70%", "Created 5 comprehensive user manuals"],
      github: "https://github.com/suheilamorales",
      email: "suheila.morales@usa.edu.ph",
      portfolio: "https://suheilamorales.write",
      personality: ["Articulate", "Thorough", "Organized", "User-Focused"],
      availability: "Open for documentation projects"
    }
  ];

  const teamStats = [
    { icon: Rocket, value: "50+", label: "Projects Completed" },
    { icon: Zap, value: "3+", label: "Years Experience" },
    { icon: Users, value: "15+", label: "Technologies" },
    { icon: Star, value: "100%", label: "Client Satisfaction" }
  ];

  const technologies = [
    { name: "React", category: "Frontend", icon: Cogs },
    { name: "Node.js", category: "Backend", icon: Server },
    { name: "MongoDB", category: "Database", icon: Database },
    { name: "TypeScript", category: "Language", icon: Code },
    { name: "AWS", category: "Cloud", icon: Cloud },
    { name: "Figma", category: "Design", icon: Palette },
    { name: "Docker", category: "DevOps", icon: Cpu },
    { name: "Git", category: "Tools", icon: Github }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative mb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full px-6 py-3 mb-8 shadow-2xl shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white uppercase tracking-wider">
              BSIT 4A - Elite Group 4
            </span>
          </div>
          
          <h1 className="text-6xl font-black text-white mb-6 leading-tight">
            The <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Architects</span>
            <br />
            of Innovation
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Crafting the future of library management with cutting-edge technology. 
            Meet the elite team behind <span className="text-cyan-400 font-semibold">CircuLink</span> - 
            where innovation meets excellence in digital transformation.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {teamStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-500 group">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          {teamMembers.map((member) => {
            const IconComponent = member.icon;
            return (
              <div
                key={member.id}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl hover:shadow-cyan-500/10 transition-all duration-700 transform hover:-translate-y-2 cursor-pointer border border-gray-700/50 overflow-hidden relative"
                onClick={() => setActiveMember(member)}
              >
                {/* Animated Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-purple-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <div className="relative p-8">
                  <div className="flex items-start gap-6">
                    {/* Profile Image */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 p-1 shadow-2xl">
                        <div className="w-full h-full rounded-xl bg-gray-900 overflow-hidden">
                          {imageError[member.id] || !member.image ? (
                            <FallbackAvatar name={member.name} />
                          ) : (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(member.id)}
                            />
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full p-2 border-2 border-gray-800 shadow-lg">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full p-2">
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-semibold">
                          {member.role}
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {member.description}
                      </p>
                      
                      {/* Skills Preview */}
                      <div className="flex flex-wrap gap-2">
                        {member.skills.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-xs font-medium border border-gray-600/50"
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 4 && (
                          <span className="bg-gray-700/50 text-gray-400 px-3 py-1 rounded-full text-xs font-medium">
                            +{member.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                      View Profile
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technologies Section */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl p-12 mb-16 border border-gray-700/50">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Tech Stack</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powered by cutting-edge technologies to deliver exceptional performance and user experience
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {technologies.map((tech, index) => {
              const IconComponent = tech.icon;
              return (
                <div key={index} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 group">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-center mb-2">{tech.name}</h3>
                  <p className="text-cyan-400 text-sm text-center">{tech.category}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="relative bg-gradient-to-br from-gray-800 to-black rounded-3xl p-12 border border-gray-700/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
          <div className="relative text-center max-w-4xl mx-auto">
            <Globe className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Shaping the Future of <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Digital Education</span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              We are revolutionizing library management through innovative technology solutions. 
              Our mission is to create seamless, efficient, and user-friendly systems that empower 
              educational institutions and enhance the learning experience for the Augustinian community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-cyan-500/20 text-cyan-400 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2">
                <Target className="w-5 h-5" />
                Innovation Driven
              </div>
              <div className="bg-purple-500/20 text-purple-400 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Quality Focused
              </div>
              <div className="bg-blue-500/20 text-blue-400 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Future Ready
              </div>
            </div>
          </div>
        </div>

        {/* Member Detail Modal */}
        {activeMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background Blur Overlay */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity duration-500"
              onClick={() => setActiveMember(null)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-700/50">
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-6 right-6 z-10 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-2xl p-3 transition-all duration-300 shadow-2xl backdrop-blur-sm border border-gray-600/50 hover:border-cyan-500/50"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col xl:flex-row">
                {/* Left Side - Profile */}
                <div className="xl:w-2/5 bg-gradient-to-b from-cyan-900/30 to-purple-900/30 p-10 text-white border-r border-gray-700/50">
                  <div className="text-center xl:text-left">
                    {/* Profile Header */}
                    <div className="flex xl:flex-col items-center xl:items-start gap-6 mb-8">
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 p-2 shadow-2xl">
                        <div className="w-full h-full rounded-xl bg-gray-900 overflow-hidden">
                          {imageError[activeMember.id] || !activeMember.image ? (
                            <FallbackAvatar name={activeMember.name} />
                          ) : (
                            <img
                              src={activeMember.image}
                              alt={activeMember.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{activeMember.name}</h2>
                        <div className="flex items-center gap-2 mb-4">
                          <activeMember.icon className="w-5 h-5 text-cyan-400" />
                          <span className="text-cyan-400 font-semibold text-lg">{activeMember.role}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {activeMember.personality.map((trait, index) => (
                            <span key={index} className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Bio */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-cyan-400">Professional Bio</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {activeMember.detailedBio}
                      </p>
                    </div>

                    {/* Availability */}
                    <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-semibold">{activeMember.availability}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Details */}
                <div className="xl:w-3/5 p-10 overflow-y-auto max-h-[85vh]">
                  {/* Skills Section */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-cyan-400" />
                      Core Competencies
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {activeMember.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                            <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">{skill}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <Cpu className="w-6 h-6 text-purple-400" />
                      Technology Stack
                    </h3>
                    <div className="space-y-3">
                      {activeMember.techStack.map((tech, index) => (
                        <div key={index} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                          <span className="text-gray-300 font-medium">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <Star className="w-6 h-6 text-yellow-400" />
                      Key Achievements
                    </h3>
                    <div className="space-y-4">
                      {activeMember.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start gap-4 bg-gray-800/30 rounded-2xl p-4 border border-gray-700/30">
                          <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                          </div>
                          <span className="text-gray-300">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                    <h4 className="text-xl font-bold text-white mb-6">Connect & Collaborate</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <a
                        href={activeMember.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl transition-all duration-300 group border border-gray-600/50 hover:border-cyan-500/50"
                      >
                        <Github className="w-5 h-5" />
                        <span className="font-semibold">GitHub</span>
                      </a>
                      <a
                        href={`mailto:${activeMember.email}`}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white px-6 py-4 rounded-xl transition-all duration-300 group border border-cyan-500/50"
                      >
                        <Mail className="w-5 h-5" />
                        <span className="font-semibold">Email</span>
                      </a>
                      <a
                        href={activeMember.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-6 py-4 rounded-xl transition-all duration-300 group border border-purple-500/50"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <span className="font-semibold">Portfolio</span>
                      </a>
                    </div>
                  </div>
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