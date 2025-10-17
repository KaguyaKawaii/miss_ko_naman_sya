// src/Homepage/Links/Developers.jsx
import { useState } from "react";
import { Github, Mail, ExternalLink, Code, Palette, FileText, Users, X, Star, Award, Zap, Calendar, MapPin, BookOpen, Heart } from "lucide-react";

// Import images - Fixed the import syntax
import PatrickImage from "../../assets/Profile/image1.png";
import SuheilaImage from "../../assets/Profile/image2.png";
import LouisImage from "../../assets/Profile/image3.png";
import StephenImage from "../../assets/Profile/image4.png";

function Developers() {
  const [activeMember, setActiveMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: "Stephen Madero Jr.",
      role: "Lead Developer",
      icon: Code,
      image: StephenImage,
      description: "I'm an aspiring Full-stack Developer currently learning React and Node.js. I'm passionate about building clean, responsive, and user-friendly applications while exploring how to make systems faster and more efficient.",
      bio: "Stephen is an aspiring web developer currently learning how to build modern, scalable applications using React and Node.js. He enjoys exploring new technologies, improving his coding skills, and creating simple projects to apply what he learns. With a growing passion for clean code and efficient design, Stephen is continuously learning best practices to become a confident full-stack developer.",
      skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript", "JavaScript", "HTML", "CSS"],
      github: "https://github.com/patrickandrade",
      email: "",
      portfolio: "",
      joinDate: "2022",
      location: "Janiuay, Iloilo City, Philippines",
     interests: [
  "Web Development",
  "React and Node.js",
  "UI/UX Design",
  "Learning New Technologies",
  "Building Scalable Applications",
  "Open-Source Projects",
  "Problem Solving",
  "Database Design",
  "Clean Code Practices"
],

      favoriteTech: [
  "React.js ",
  "Node.js ",
  "Express.js ",
  "MongoDB ",
  "JavaScript ",  "Tailwind CSS ",
  "HTML5 ",
  "CSS3 ",
  "Git & GitHub"
],
    },
    {
      id: 2,
      name: "Louis Miguel Parenno",
      role: "UI/UX Designer",
      icon: Palette,
      image: LouisImage,
      description: "Creative designer focused on user experience and interface design. Ensures the application is intuitive and visually appealing.",
      bio: "Louis brings designs to life with a user-centered approach, having worked on multiple digital products across various industries. He believes that great design should not only look beautiful but also solve real user problems effectively. His design philosophy centers around simplicity, accessibility, and emotional connection.",
      skills: ["Figma", "UI/UX Design", "Prototyping", "User Research", "Wireframing", "Adobe Creative Suite", "Design Systems", "User Testing", "Interaction Design", "Design Thinking"],
      github: "https://github.com/suheilamorales",
      email: "suheila.morales@usa.edu.ph",
      portfolio: "https://suheilamorales.design",
      joinDate: "2021",
      location: "Iloilo City, Philippines",
      interests: ["Design Systems", "User Psychology", "Digital Illustration", "Design Workshops"],
      favoriteTech: "Figma & Protopie"
    },
    {
      id: 3,
      name: "Suheila Belle Morales",
      role: "Documentation Specialist",
      icon: FileText,
      image: SuheilaImage,
      description: "Technical writer and documentation expert. Creates comprehensive user guides and system documentation.",
      bio: "Suheila transforms complex technical concepts into clear, accessible documentation that empowers users and developers alike. With a background in both technical writing and software development, she bridges the gap between technical teams and end-users. Her documentation has helped thousands of users navigate complex software systems with ease.",
      skills: ["Technical Writing", "Documentation", "User Manuals", "API Docs", "Markdown", "Content Strategy", "Knowledge Management", "Process Documentation", "Information Architecture", "GitBook"],
      github: "https://github.com/louisparenno",
      email: "louis.parenno@usa.edu.ph",
      portfolio: "https://louisparenno.write",
      joinDate: "2022",
      location: "Iloilo City, Philippines",
      interests: ["Technical Blogs", "User Education", "Content Strategy", "Knowledge Sharing"],
      favoriteTech: "Markdown & GitBook"
    },
    {
      id: 4,
      name: "Patrick Miguel Andrade",
      role: "Project Manager",
      icon: Users,
      image: PatrickImage,
      description: "Project coordinator ensuring timely delivery and team collaboration. Manages project timelines and stakeholder communication.",
      bio: "Patrick excels at bringing order to complex projects and ensuring teams work together efficiently. With certifications in Agile methodologies and years of experience managing tech projects, he ensures that CircuLink delivers value to users while maintaining high quality standards. His leadership style focuses on empowerment and clear communication.",
      skills: ["Agile Methodology", "Project Planning", "Team Coordination", "Risk Management", "Scrum", "Leadership", "Stakeholder Management", "Quality Assurance", "JIRA", "Confluence"],
      github: "https://github.com/stephenmadero",
      email: "stephen.madero@usa.edu.ph",
      portfolio: "https://stephenmadero.pm",
      joinDate: "2021",
      location: "Iloilo City, Philippines",
      interests: ["Agile Coaching", "Team Building", "Process Optimization", "Leadership"],
      favoriteTech: "JIRA & Confluence"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-sm border border-gray-200">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              BSIT 4A - Group 4
            </span>
            <Star className="w-5 h-5 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our <span className="text-blue-600">Team</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The passionate developers behind <span className="font-semibold text-blue-600">CircuLink</span> - 
            creating innovative solutions for the Augustinian community.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {teamMembers.map((member) => {
            const IconComponent = member.icon;
            return (
              <div
                key={member.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 overflow-hidden"
                onClick={() => setActiveMember(member)}
              >
                {/* Profile Image */}
                <div className="relative h-[15rem] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <div className="w-[50rem] h-24 rounded-full bg-white p-1 shadow-lg">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md">
                    <div className="bg-blue-100 rounded-full p-1.5">
                      <IconComponent className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                {/* Profile Content */}
                <div className="p-6 text-center">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium text-sm mb-3 bg-blue-50 px-3 py-1 rounded-full inline-block">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                    {member.description}
                  </p>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {member.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs font-medium">
                        +{member.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-12 border border-gray-100">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission at <span className="text-blue-600">CircuLink</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              As fourth-year BS Information Technology students from the prestigious University of San Agustin, 
              we are committed to solving real-world challenges through innovative technology. CircuLink represents 
              our dedication to enhancing the library experience for the Augustinian community.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Code, title: "Innovation", description: "Cutting-edge solutions" },
                { icon: Users, title: "Collaboration", description: "Teamwork driven" },
                { icon: Award, title: "Excellence", description: "Quality focused" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Member Detail Modal */}
        {activeMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background Overlay */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setActiveMember(null)}
            />
            
            {/* Modal Content - Larger Size */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200">
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-6 right-6 z-10 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col lg:flex-row h-full">
                {/* Left Side - Enhanced Profile */}
                <div className="lg:w-2/5 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border-r border-gray-200">
                  <div className="text-center h-full flex flex-col">
                    {/* Large Profile Picture */}
                    <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-white p-3 shadow-lg border border-gray-200">
                      <img
                        src={activeMember.image}
                        alt={activeMember.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{activeMember.name}</h2>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <activeMember.icon className="w-6 h-6 text-blue-600" />
                      <span className="font-semibold text-blue-600 text-xl">{activeMember.role}</span>
                    </div>
                    
                    {/* Personal Info Cards */}
                    <div className="space-y-4 mb-6">
                      <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{activeMember.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Member since {activeMember.joinDate}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          Favorite Tools
                        </div>
                        <p className="text-sm text-gray-600">{activeMember.favoriteTech}</p>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center space-x-3 mt-auto">
                      {[
                        { icon: Github, href: activeMember.github, label: "GitHub" },
                        { icon: Mail, href: `mailto:${activeMember.email}`, label: "Email" },
                        { icon: ExternalLink, href: activeMember.portfolio, label: "Portfolio" }
                      ].map((social, index) => (
                        <a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
                          title={social.label}
                        >
                          <social.icon className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Enhanced Details */}
                <div className="lg:w-3/5 p-8 overflow-y-auto max-h-[85vh]">
                  {/* Bio Section */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <Heart className="w-6 h-6 text-blue-600" />
                      About Me
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {activeMember.bio}
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Award className="w-6 h-6 text-blue-600" />
                      Skills & Expertise
                    </h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {activeMember.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 rounded-xl p-4 text-center border border-gray-200 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                        >
                          <span className="font-semibold text-gray-800 text-sm">
                            {skill}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interests Section */}
                  

                  {/* Enhanced Contact Section */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                    <h4 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-3">
                      <Users className="w-6 h-6 text-blue-600" />
                      Get in Touch
                    </h4>
                    <div className="space-y-4">
                      {[
                        { 
                          icon: Github, 
                          href: activeMember.github, 
                          label: "View GitHub Profile",
                          description: "Check out my projects and contributions",
                          bg: "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black",
                          text: "text-white"
                        },
                        { 
                          icon: Mail, 
                          href: `mailto:${activeMember.email}`, 
                          label: "Send Email",
                          description: "Let's discuss potential collaborations",
                          bg: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                          text: "text-white"
                        },
                        { 
                          icon: ExternalLink, 
                          href: activeMember.portfolio, 
                          label: "Visit Portfolio",
                          description: "Explore my work and experience",
                          bg: "bg-white hover:bg-gray-50 border border-gray-300",
                          text: "text-gray-700"
                        }
                      ].map((contact, index) => (
                        <a
                          key={index}
                          href={contact.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-start gap-4 ${contact.bg} ${contact.text} px-6 py-4 rounded-xl transition-all duration-300 w-full group hover:shadow-lg`}
                        >
                          <div className="bg-white/20 rounded-lg p-2">
                            <contact.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-base">{contact.label}</div>
                            <div className="text-sm opacity-80 mt-1">{contact.description}</div>
                          </div>
                          <ExternalLink className="w-5 h-5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </a>
                      ))}
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