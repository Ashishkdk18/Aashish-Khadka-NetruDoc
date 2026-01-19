import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { userApi } from '../api/userApi'
import { User } from '../models/userModels'

const AdminPatientProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const [patient, setPatient] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (id && isAdmin) {
      loadPatientProfile()
    }
  }, [id, isAdmin])

  const loadPatientProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await userApi.getUserById(id!)
      if (response.status === 'success') {
        setPatient(response.data.user)
      } else {
        setError(response.message || 'Failed to load patient profile')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patient profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center px-6 md:px-12">
          <div className="max-w-md text-center">
            <div className="text-red-500 text-lg mb-4">Access Denied</div>
            <p className="text-secondary">Admin privileges required to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center px-6 md:px-12">
          <div className="max-w-md text-center">
            <div className="text-red-500 text-lg mb-4">Patient Not Found</div>
            <p className="text-secondary mb-8">{error || 'The patient profile you are looking for does not exist.'}</p>
            <Link
              to="/admin/patients"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-background hover:bg-secondary transition-colors duration-300 text-sm font-medium rounded-full"
            >
              Back to Patients
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <span className="inline-block text-sm font-sans font-medium uppercase tracking-widest text-secondary">
                <span className="mr-2 text-accent">+</span>
                Admin Panel
              </span>
              <Link
                to="/admin/patients"
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-background hover:bg-secondary transition-colors duration-300 text-sm font-medium rounded-full"
              >
                ← Back to Patients
              </Link>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-medium text-primary leading-[0.9] -ml-1">
              {patient.name}
            </h1>
            <p className="text-lg text-secondary mt-4">
              Patient profile and medical information
            </p>
          </div>
        </div>
      </section>

      {/* Patient Details */}
      <section className="pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Basic Information */}
          <div className="bg-soft-blue/30 p-8 md:p-12 rounded-2xl">
            <h2 className="text-2xl font-display font-medium text-primary mb-8">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Email</div>
                <div className="text-lg text-primary">{patient.email}</div>
              </div>
              {patient.phone && (
                <div>
                  <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Phone</div>
                  <div className="text-lg text-primary">{patient.phone}</div>
                </div>
              )}
              {patient.dateOfBirth && (
                <div>
                  <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Date of Birth</div>
                  <div className="text-lg text-primary">{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                </div>
              )}
              {patient.gender && (
                <div>
                  <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Gender</div>
                  <div className="text-lg text-primary">{patient.gender}</div>
                </div>
              )}
              <div>
                <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Status</div>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  patient.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {patient.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Verified</div>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  patient.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {patient.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>

            {patient.address && (
              <div className="mt-8">
                <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Address</div>
                <div className="text-lg text-primary">
                  {[
                    patient.address.street,
                    patient.address.city,
                    patient.address.state,
                    patient.address.zipCode,
                    patient.address.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          {patient.emergencyContact && (
            <div className="bg-soft-blue/30 p-8 md:p-12 rounded-2xl">
              <h2 className="text-2xl font-display font-medium text-primary mb-8">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Name</div>
                  <div className="text-lg text-primary">{patient.emergencyContact.name}</div>
                </div>
                <div>
                  <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Phone</div>
                  <div className="text-lg text-primary">{patient.emergencyContact.phone}</div>
                </div>
                <div>
                  <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Relationship</div>
                  <div className="text-lg text-primary">{patient.emergencyContact.relationship}</div>
                </div>
              </div>
            </div>
          )}

          {/* Medical History */}
          {patient.medicalHistory && patient.medicalHistory.length > 0 && (
            <div className="bg-soft-blue/30 p-8 md:p-12 rounded-2xl">
              <h2 className="text-2xl font-display font-medium text-primary mb-8">Medical History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {patient.medicalHistory.map((item, index) => (
                  <div key={index} className="bg-white/50 p-6 rounded-xl">
                    <div className="space-y-3">
                      <h3 className="text-lg font-display font-medium text-primary">{item.condition}</h3>
                      {item.diagnosedDate && (
                        <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary">
                          Diagnosed: {new Date(item.diagnosedDate).toLocaleDateString()}
                        </div>
                      )}
                      {item.notes && (
                        <p className="text-secondary leading-relaxed">{item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-soft-blue/30 p-8 md:p-12 rounded-2xl">
            <h2 className="text-2xl font-display font-medium text-primary mb-8">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Joined Date</div>
                <div className="text-lg text-primary">
                  {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-2">Last Updated</div>
                <div className="text-lg text-primary">
                  {patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminPatientProfilePage
