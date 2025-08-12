import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyProfile = () => {
  // const [userData, setUserData] = useState({
  //   name: 'Edward Elric',
  //   image: assets.profile_pic,
  //   email: 'edward@gmail.com',
  //   phone: '123-456-7890',
  //   address: {
  //     line1: '123 Alchemy St',
  //     line2: 'Central City',
  //   },
  //   gender: 'male',
  //   dob: '1999-01-01',
  // })

  const {userData,setUserData,token,backendUrl , loadUserProfileData}=useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [image,setImage]=useState(false)

  const updateUserProfileData= async ()=>{
      try {
        const formData= new FormData()

        formData.append("name",userData.name)
        // formData.append("email",userData.email)
        formData.append("phone",userData.phone)
        formData.append("address",JSON.stringify(userData.address))
        formData.append("gender",userData.gender)
        formData.append("dob",userData.dob)

        image && formData.append("image",image)

        const {data}= await axios.post(backendUrl + "/api/user/update-profile",formData,{headers:{token}})

        if(data.success){
          toast.success(data.message)
          await loadUserProfileData()
          setIsEdit(false)
          setImage(false)
        } else{
          toast.error(data.message)
        }

      } catch (error) {
        console.log(error)
        toast.error(error.message)
        
      }
  }

  return userData && (
    <div className="max-w-3xl mx-auto px-6 py-10 bg-white shadow-xl rounded-2xl space-y-8">
      {/* Profile Picture and Name */}
      <div className="flex items-center gap-6">
        {
          isEdit ?
          <label htmlFor='image'>
            <div>
              <img src={image ? URL.createObjectURL(image):userData.image} alt="" />
              <img src={image ? "" : assets.upload_icon} alt="" />
            </div>
            <input onChange={(e)=>setImage(e.target.files[0])} type="file"  id="image" hidden />
          </label>
          : <img src={userData.image} alt="Profile" className="w-24 h-24 rounded-full object-cover border" />
        }
       
        <div>
          {isEdit ? (
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
              className="border px-3 py-1 rounded-md w-full text-lg font-medium"
            />
          ) : (
            <p className="text-xl font-semibold">{userData.name}</p>
          )}
        </div>
      </div>

      <hr />

      {/* Contact Information */}
      <div>
        <p className="text-lg font-semibold text-gray-700 mb-2">Contact Information</p>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Email:</p>
            <p>{userData.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone:</p>
            {isEdit ? (
              <input
                type="text"
                value={userData.phone}
                onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))}
                className="border px-3 py-1 rounded-md w-full"
              />
            ) : (
              <p>{userData.phone}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Address:</p>
            {isEdit ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={userData.address.line1}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                  className="border px-3 py-1 rounded-md w-full"
                />
                <input
                  type="text"
                  value={userData.address.line2}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                  className="border px-3 py-1 rounded-md w-full"
                />
              </div>
            ) : (
              <p>
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
            )}
          </div>
        </div>
      </div>

      <hr />

      {/* Basic Information */}
      <div>
        <p className="text-lg font-semibold text-gray-700 mb-2">Basic Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Gender:</p>
            {isEdit ? (
              <select
                value={userData.gender}
                onChange={(e) => setUserData((prev) => ({ ...prev, gender: e.target.value }))}
                className="border px-3 py-1 rounded-md w-full"
              >
                {/* <option >Select Gender</option> */}
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            ) : (
              <p>{userData.gender}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth:</p>
            {isEdit ? (
              <input
                type="date"
                value={userData.dob}
                onChange={(e) => setUserData((prev) => ({ ...prev, dob: e.target.value }))}
                className="border px-3 py-1 rounded-md w-full"
              />
            ) : (
              <p>{userData.dob}</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit / Save Button */}
      <div className="text-center mt-6">
        {isEdit ? (
          <button
            onClick={updateUserProfileData}
            className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

export default MyProfile
