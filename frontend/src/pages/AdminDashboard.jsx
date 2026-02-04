import React from 'react';

const AdminDashboard = () => {
    // Mock data for the hackathon demo
    const mockReports = [
        { id: 1, type: 'Pothole', location: 'Main St & 5th Ave', risk: 85, status: 'Pending', date: '2023-10-27' },
        { id: 2, type: 'Broken Streetlight', location: 'Elm Park', risk: 45, status: 'In Progress', date: '2023-10-26' },
        { id: 3, type: 'Garbage Pile', location: 'Market Square', risk: 60, status: 'Pending', date: '2023-10-27' },
        { id: 4, type: 'Fallen Tree', location: 'Riverside Dr', risk: 92, status: 'Resolved', date: '2023-10-25' },
    ];

    const getRiskColor = (risk) => {
        if (risk >= 80) return 'bg-red-100 text-red-800';
        if (risk >= 50) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    return (
        <div className="space-y-6">
            <header className="bg-white shadow rounded-lg p-6">
                <h1 className="text-3xl font-bold text-gray-900">City Command Center</h1>
                <p className="mt-2 text-sm text-gray-600">Overview of reported infrastructure issues</p>
            </header>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Incoming Reports
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Issue Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    AI Risk Score
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockReports.map((report) => (
                                <tr key={report.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{report.type}</div>
                                        <div className="text-sm text-gray-500">{report.date}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{report.location}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(report.risk)}`}>
                                            {report.risk}/100
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {report.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
