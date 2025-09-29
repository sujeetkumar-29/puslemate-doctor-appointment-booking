import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddDoctor = () => {
    const [docImg, setDocImg] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [experience, setExperience] = useState("1 Year");
    const [fees, setFees] = useState("");
    const [speciality, setSpeciality] = useState("General physician");
    const [degree, setDegree] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [about, setAbout] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { backendUrl, aToken } = useContext(AdminContext);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        
        try {
            if (!docImg) {
                toast.error("Please upload a doctor image");
                setIsLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("image", docImg);
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("experience", experience);
            formData.append("fees", Number(fees));
            formData.append("speciality", speciality);
            formData.append("degree", degree);
            formData.append("address", JSON.stringify({line1: address1, line2: address2}));
            formData.append("about", about);

            const { data } = await axios.post(backendUrl + "/api/admin/add-doctor", formData, {
                headers: { aToken }
            });

            if (data.success) {
                toast.success(data.message);
                // Reset form
                setDocImg(false);
                setName("");
                setEmail("");
                setPassword("");
                setAddress1("");
                setAddress2("");
                setDegree("");
                setAbout("");
                setFees("");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 overflow-y-scroll h-[90vh]">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Doctor</h1>
                <p className="text-gray-600">Fill in the doctor's information to add them to the system</p>
            </div>

            {/* Form Container */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
                <form onSubmit={onSubmitHandler} className="p-8 space-y-8">
                    
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative group">
                            <label htmlFor="doc-img" className="cursor-pointer block">
                                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-300 group-hover:scale-105">
                                    {docImg ? (
                                        <img 
                                            src={URL.createObjectURL(docImg)}
                                            alt="Doctor Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <p className="text-blue-600 text-sm font-medium">Upload Photo</p>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-all duration-300 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </label>
                            <input 
                                onChange={(e) => setDocImg(e.target.files[0])} 
                                type="file" 
                                id="doc-img" 
                                accept="image/*"
                                hidden 
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-gray-700 font-medium">Doctor's Profile Picture</p>
                            <p className="text-gray-500 text-sm">Recommended: Square image, at least 400x400px</p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Personal Information */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                Personal Information
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input 
                                        onChange={(e) => setName(e.target.value)} 
                                        value={name}
                                        type="text"
                                        placeholder="Dr. John Doe"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        value={email}
                                        type="email"
                                        placeholder="doctor@hospital.com"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <input 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        value={password}
                                        type="password"
                                        placeholder="Secure password"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Experience *
                                        </label>
                                        <select 
                                            onChange={(e) => setExperience(e.target.value)} 
                                            value={experience}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        >
                                            <option value="1 Year">1 Year</option>
                                            <option value="2 Years">2 Years</option>
                                            <option value="3 Years">3 Years</option>
                                            <option value="4 Years">4 Years</option>
                                            <option value="5 Years">5 Years</option>
                                            <option value="6 Years">6 Years</option>
                                            <option value="7 Years">7 Years</option>
                                            <option value="8 Years">8 Years</option>
                                            <option value="9 Years">9 Years</option>
                                            <option value="10+ Years">10+ Years</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Consultation Fees *
                                        </label>
                                        <input 
                                            onChange={(e) => setFees(e.target.value)} 
                                            value={fees}
                                            type="number"
                                            placeholder="500"
                                            required
                                            min="0"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                Professional Details
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Speciality *
                                    </label>
                                    <select 
                                        onChange={(e) => setSpeciality(e.target.value)} 
                                        value={speciality}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value="General physician">General Physician</option>
                                        <option value="Gynecologist">Gynecologist</option>
                                        <option value="Dermatologist">Dermatologist</option>
                                        <option value="Pediatricians">Pediatricians</option>
                                        <option value="Neurologist">Neurologist</option>
                                        <option value="Gastroenterologist">Gastroenterologist</option>
                                        <option value="Cardiologist">Cardiologist</option>
                                        <option value="Orthopedist">Orthopedist</option>
                                        <option value="Psychiatrist">Psychiatrist</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Education & Qualifications *
                                    </label>
                                    <input 
                                        onChange={(e) => setDegree(e.target.value)} 
                                        value={degree}
                                        type="text"
                                        placeholder="MBBS, MD - Internal Medicine"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Practice Address *
                                    </label>
                                    <input 
                                        onChange={(e) => setAddress1(e.target.value)} 
                                        value={address1}
                                        type="text"
                                        placeholder="Street Address, Building Name"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                    <input 
                                        onChange={(e) => setAddress2(e.target.value)} 
                                        value={address2}
                                        type="text"
                                        placeholder="City, State, PIN Code"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            About Doctor
                        </h3>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Professional Summary *
                            </label>
                            <textarea 
                                onChange={(e) => setAbout(e.target.value)} 
                                value={about}
                                placeholder="Describe the doctor's expertise, experience, and approach to patient care..."
                                required
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                This information will be visible to patients when they view the doctor's profile.
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding Doctor...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Doctor
                                </div>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddDoctor;