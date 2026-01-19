import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="inline-block text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-4">
              <span className="mr-2 text-accent">+</span>
              Dashboard
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-medium text-primary leading-[0.9] -ml-1">
              Welcome back,<br />
              <span className="text-secondary opacity-60">{user?.name}!</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Quick Actions Card */}
            <div className="group">
              <div className="bg-soft-blue/30 p-8 md:p-12 rounded-2xl hover:bg-soft-blue/40 transition-colors duration-500">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-accent text-2xl group-hover:text-primary transition-colors duration-300">01</span>
                    <h3 className="text-2xl font-display font-medium text-primary">Quick Actions</h3>
                  </div>
                  <p className="text-secondary text-lg leading-relaxed">
                    Dashboard functionality coming soon...
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="group">
              <div className="bg-soft-blue/30 p-8 md:p-12 rounded-2xl hover:bg-soft-blue/40 transition-colors duration-500">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-accent text-2xl group-hover:text-primary transition-colors duration-300">02</span>
                    <h3 className="text-2xl font-display font-medium text-primary">Recent Activity</h3>
                  </div>
                  <p className="text-secondary text-lg leading-relaxed">
                    Activity tracking coming soon...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
