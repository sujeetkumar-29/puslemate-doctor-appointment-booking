// import React from 'react';
// import { Award, Users, Star, Heart } from 'lucide-react';

// const DoctorAchievements = () => {
//   const doctors = [
//     { 
//       name: "Dr. Kafeel Ahmad", 
//       specialty: "General Physician",
//       achievement: "Successfully managed 500+ hypertension cases",
//       experience: "Helped elderly patients achieve normal blood pressure through lifestyle modifications and medication management"
//     },
//     { 
//       name: "Dr. Ajay Kumar", 
//       specialty: "General Physician",
//       achievement: "95% success rate in diabetes management",
//       experience: "Transformed lives of 300+ diabetic patients with personalized treatment plans and dietary counseling"
//     },
//     { 
//       name: "Dr. M A Zahid", 
//       specialty: "General Physician",
//       achievement: "Expert in respiratory illness treatment",
//       experience: "Successfully treated 800+ patients with asthma, COPD, and respiratory infections with zero complications"
//     },
//     { 
//       name: "Dr. Md Israil", 
//       specialty: "Pediatrician",
//       achievement: "Specialized in childhood immunization programs",
//       experience: "Protected 1000+ children from preventable diseases through comprehensive vaccination schedules"
//     },
//     { 
//       name: "Dr. Neha Sharma", 
//       specialty: "Gynecologist",
//       achievement: "Performed 200+ successful normal deliveries",
//       experience: "Helped mothers through safe pregnancies and childbirth with comprehensive prenatal and postnatal care"
//     },
//     { 
//       name: "Dr. Anita Verma", 
//       specialty: "Pediatrician",
//       achievement: "Expert in treating childhood malnutrition",
//       experience: "Restored health of 600+ malnourished children through targeted nutrition therapy and family education"
//     },
//     { 
//       name: "Dr. Pankaj Singh", 
//       specialty: "Gastroenterologist",
//       achievement: "Cured 400+ patients from peptic ulcers",
//       experience: "Eliminated H. pylori infections and healed chronic ulcers using advanced treatment protocols"
//     },
//     { 
//       name: "Dr. Rakesh Tiwari", 
//       specialty: "Neurologist",
//       achievement: "Successfully managed 150+ epilepsy cases",
//       experience: "Achieved seizure-free life for patients through precise medication management and lifestyle guidance"
//     },
//     { 
//       name: "Dr. Priya Sharma", 
//       specialty: "Dermatologist",
//       achievement: "Treated 800+ cases of skin allergies and eczema",
//       experience: "Provided complete relief from chronic skin conditions through personalized treatment and skincare regimens"
//     },
//     { 
//       name: "Dr. Manju Devi", 
//       specialty: "Pediatrician",
//       achievement: "Specialist in treating childhood asthma",
//       experience: "Helped 250+ children breathe freely again through effective asthma management and environmental control"
//     },
//     { 
//       name: "Dr. Sunil Chaudhary", 
//       specialty: "Dermatologist",
//       achievement: "Expert in treating fungal infections",
//       experience: "Completely cured 600+ patients suffering from persistent fungal skin infections using advanced antifungal therapy"
//     },
//     { 
//       name: "Dr. Sushil Kumar", 
//       specialty: "Gastroenterologist",
//       achievement: "Specialist in treating liver disorders",
//       experience: "Reversed fatty liver disease in 300+ patients through dietary modifications and medication management"
//     },
//     { 
//       name: "Dr. Santosh", 
//       specialty: "Gastroenterologist",
//       achievement: "Expert in inflammatory bowel disease treatment",
//       experience: "Achieved remission in 200+ patients with Crohn's disease and ulcerative colitis through targeted therapy"
//     },
//     { 
//       name: "Dr. Vijay", 
//       specialty: "Gastroenterologist",
//       achievement: "Successful treatment of chronic constipation",
//       experience: "Provided lasting relief to 500+ patients suffering from chronic digestive issues through holistic treatment approaches"
//     }
//   ];

//   const specialtyColors = {
//     "General Physician": "bg-blue-50 border-blue-200 text-blue-800",
//     "Pediatrician": "bg-pink-50 border-pink-200 text-pink-800",
//     "Gynecologist": "bg-purple-50 border-purple-200 text-purple-800",
//     "Gastroenterologist": "bg-green-50 border-green-200 text-green-800",
//     "Neurologist": "bg-indigo-50 border-indigo-200 text-indigo-800",
//     "Dermatologist": "bg-yellow-50 border-yellow-200 text-yellow-800"
//   };

//   const specialtyStats = doctors.reduce((acc, doctor) => {
//     acc[doctor.specialty] = (acc[doctor.specialty] || 0) + 1;
//     return acc;
//   }, {});

//   const achievements = [
//     {
//       title: "Comprehensive Healthcare Team",
//       description: "14 specialized doctors across 6 medical specialties",
//       icon: <Users className="w-8 h-8 text-blue-600" />,
//       value: "14 Doctors"
//     },
//     {
//       title: "Multi-Specialty Excellence",
//       description: "Covering essential medical specialties for complete patient care",
//       icon: <Award className="w-8 h-8 text-green-600" />,
//       value: "6 Specialties"
//     },
//     {
//       title: "Patient-Centered Care",
//       description: "Dedicated team committed to providing quality healthcare",
//       icon: <Heart className="w-8 h-8 text-red-600" />,
//       value: "Quality Care"
//     },
//     {
//       title: "Medical Excellence",
//       description: "Experienced professionals in their respective fields",
//       icon: <Star className="w-8 h-8 text-yellow-600" />,
//       value: "Expert Team"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="text-center mb-16">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
//             <Award className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//             Medical Excellence Achievements
//           </h1>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Celebrating our dedicated team of healthcare professionals committed to providing 
//             exceptional medical care across multiple specialties
//           </p>
//         </div>

//         {/* Achievement Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
//           {achievements.map((achievement, index) => (
//             <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
//               <div className="flex items-center justify-center mb-4">
//                 {achievement.icon}
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
//                 {achievement.title}
//               </h3>
//               <p className="text-sm text-gray-600 mb-3 text-center">
//                 {achievement.description}
//               </p>
//               <div className="text-center">
//                 <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                   {achievement.value}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Specialty Statistics */}
//         <div className="bg-white rounded-2xl shadow-lg p-8 mb-16 border border-gray-100">
//           <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
//             Our Medical Specialties
//           </h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//             {Object.entries(specialtyStats).map(([specialty, count]) => (
//               <div key={specialty} className="text-center p-4 rounded-lg bg-gray-50">
//                 <div className="text-2xl font-bold text-blue-600 mb-1">{count}</div>
//                 <div className="text-sm text-gray-700 font-medium">{specialty}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Doctors Grid */}
//         <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
//           <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
//             Our Distinguished Medical Team
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {doctors.map((doctor, index) => (
//               <div key={index} className="group hover:scale-105 transition-transform duration-200">
//                 <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100 h-full">
//                   <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4">
//                     <span className="text-white text-xl font-bold">
//                       {doctor.name.split(' ')[1]?.[0] || doctor.name.split(' ')[0][0]}
//                     </span>
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 text-center mb-3">
//                     {doctor.name}
//                   </h3>
//                   <div className="flex justify-center mb-4">
//                     <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${specialtyColors[doctor.specialty] || 'bg-gray-50 border-gray-200 text-gray-800'}`}>
//                       {doctor.specialty}
//                     </span>
//                   </div>
                  
//                   {/* Achievement Section */}
//                   <div className="bg-green-50 rounded-lg p-4 mb-4 border-l-4 border-green-500">
//                     <div className="flex items-center mb-2">
//                       <Award className="w-4 h-4 text-green-600 mr-2" />
//                       <span className="text-sm font-semibold text-green-800">Key Achievement</span>
//                     </div>
//                     <p className="text-sm text-green-700 font-medium">
//                       {doctor.achievement}
//                     </p>
//                   </div>
                  
//                   {/* Experience Section */}
//                   <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
//                     <div className="flex items-center mb-2">
//                       <Heart className="w-4 h-4 text-blue-600 mr-2" />
//                       <span className="text-sm font-semibold text-blue-800">Success Story</span>
//                     </div>
//                     <p className="text-sm text-blue-700">
//                       {doctor.experience}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer Message */}
//         <div className="text-center mt-16">
//           <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
//             <h3 className="text-2xl font-bold mb-4">Committed to Your Health</h3>
//             <p className="text-lg opacity-90 max-w-3xl mx-auto">
//               Our diverse team of medical professionals works together to provide comprehensive, 
//               compassionate care tailored to each patient's unique needs.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoctorAchievements;