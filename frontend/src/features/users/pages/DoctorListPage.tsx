import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, LocalHospital as HospitalIcon, Star as StarIcon } from '@mui/icons-material'
import { userApi } from '../api/userApi'
import { User, Specialization } from '../../auth/models/authModels'

const DoctorListPage: React.FC = () => {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [specializationFilter, setSpecializationFilter] = useState<Specialization | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const specializations: Specialization[] = [
    'general-medicine',
    'cardiology',
    'dermatology',
    'neurology',
    'orthopedics',
    'pediatrics',
    'psychiatry',
    'radiology',
    'surgery',
    'urology',
    'gynecology',
    'ophthalmology'
  ]

  const specializationLabels: Record<Specialization, string> = {
    'general-medicine': 'General Medicine',
    'cardiology': 'Cardiology',
    'dermatology': 'Dermatology',
    'neurology': 'Neurology',
    'orthopedics': 'Orthopedics',
    'pediatrics': 'Pediatrics',
    'psychiatry': 'Psychiatry',
    'radiology': 'Radiology',
    'surgery': 'Surgery',
    'urology': 'Urology',
    'gynecology': 'Gynecology',
    'ophthalmology': 'Ophthalmology'
  }

  useEffect(() => {
    loadDoctors()
  }, [page, specializationFilter])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page,
        limit: 12 // Show 12 doctors per page in grid
      }

      if (specializationFilter !== 'all') {
        params.specialization = specializationFilter
      }

      const response = await userApi.getDoctors(params) as any

      if (response.status === 'success') {
        setDoctors(response.data.items || [])
        setTotalPages(response.data.pagination?.totalPages || 1)
      } else {
        setError(response.message || 'Failed to load doctors')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    if (!searchTerm) return true
    return doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           doctor.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/appointments/book/${doctorId}`)
  }

  const handleViewProfile = (doctorId: string) => {
    navigate(`/doctors/${doctorId}`)
  }

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <section className="py-24 px-6 md:px-12 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <span className="inline-block mb-6 text-sm font-sans font-medium uppercase tracking-widest text-secondary">
            <span className="mr-2 text-accent">+</span>
            Find Doctors
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-medium text-primary mb-8">
            Meet our<br />
            <span className="text-secondary opacity-60">specialists.</span>
          </h1>
          <p className="text-lg text-secondary max-w-2xl leading-relaxed mb-12">
            Connect with top-tier medical professionals. Our verified doctors are ready to provide you with personalized healthcare through secure video consultations.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 px-6 md:px-12 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors by name, specialization, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent transition-colors bg-white"
              />
            </div>

            {/* Specialization Filter */}
            <select
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value as Specialization | 'all')
                setPage(1)
              }}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent transition-colors bg-white min-w-48"
            >
              <option value="all">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>
                  {specializationLabels[spec]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <section className="py-8 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading ? (
        <section className="py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            <p className="mt-4 text-secondary">Loading doctors...</p>
          </div>
        </section>
      ) : (
        <>
          {/* Results Count */}
          <section className="py-8 px-6 md:px-12">
            <div className="max-w-6xl mx-auto">
              <p className="text-secondary">
                Showing {filteredDoctors.length} doctors
              </p>
            </div>
          </section>

          {/* Doctors Grid */}
          {filteredDoctors.length === 0 ? (
            <section className="py-24 px-6 md:px-12">
              <div className="max-w-6xl mx-auto text-center">
                <HospitalIcon className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-display font-medium text-primary mb-2">No doctors found</h3>
                <p className="text-secondary">Try adjusting your search or filter criteria</p>
              </div>
            </section>
          ) : (
            <section className="py-12 px-6 md:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-accent/20 transition-all duration-300 cursor-pointer"
                    >
                      {/* Doctor Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-16 h-16 bg-soft-blue rounded-full flex items-center justify-center text-primary font-display font-medium text-xl">
                          {doctor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-display font-medium text-primary group-hover:text-accent transition-colors">
                            Dr. {doctor.name}
                          </h3>
                          {/* Rating */}
                          {doctor.rating && (
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(doctor.rating!)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-secondary">
                                ({doctor.totalReviews || 0})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Specialization */}
                      {doctor.specialization && (
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full">
                            {specializationLabels[doctor.specialization]}
                          </span>
                        </div>
                      )}

                      {/* Details */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-secondary">Hospital:</span>
                          <span className="text-sm text-primary font-medium">
                            {doctor.hospital || 'Not specified'}
                          </span>
                        </div>

                        {doctor.experience && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-secondary">Experience:</span>
                            <span className="text-sm text-primary font-medium">
                              {doctor.experience} years
                            </span>
                          </div>
                        )}

                        {doctor.consultationFee && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-secondary">Consultation:</span>
                            <span className="text-sm text-primary font-medium">
                              Rs. {doctor.consultationFee}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {doctor.isVerified && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Verified
                          </span>
                        )}
                        {doctor.isActive && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewProfile(doctor.id)}
                          className="flex-1 px-4 py-2 border border-gray-200 text-primary hover:border-accent hover:text-accent transition-colors rounded-lg text-sm font-medium"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleBookAppointment(doctor.id)}
                          className="flex-1 px-4 py-2 bg-accent text-white hover:bg-accent/90 transition-colors rounded-lg text-sm font-medium"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <section className="py-12 px-6 md:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-center">
                  <div className="flex space-x-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === i + 1
                            ? 'bg-accent text-white'
                            : 'bg-white border border-gray-200 text-primary hover:border-accent hover:text-accent'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default DoctorListPage
