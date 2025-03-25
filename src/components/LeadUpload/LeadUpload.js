import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import moment from 'moment';

function LeadUpload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const { token } = useAuth();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const { user } = useAuth();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadStatus('Please select a file.');
            return;
        }

        setUploading(true);
        setUploadStatus('Uploading...');

        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                let data = results.data;
                try {
                    // Date formatting
                    data = data.map((row) => {
                        if (row.post_date) {
                            row.post_date = moment(row.post_date, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
                        }
                        if (row.modified_date) {
                            row.modified_date = moment(row.modified_date, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
                        }
                        return row;
                    });

                    await axios.post(`${baseUrl}/api/leads/bulk-upload`, data, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setUploadStatus('Upload successful!');
                } catch (error) {
                    console.error('Upload error:', error);
                    setUploadStatus(`Upload failed: ${error.message}`);
                } finally {
                    setUploading(false);
                }
            },
            error: (error) => {
                console.error('CSV parse error:', error);
                setUploadStatus(`CSV parse error: ${error.message}`);
                setUploading(false);
            },
        });
    };

    if (!user || user.type !== 1) {
        return <p>Access Denied. Only Admins can view this page.</p>;
    }

    return (
        <div>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload CSV'}
            </button>
            {uploadStatus && <p>{uploadStatus}</p>}
        </div>
    );
}

export default LeadUpload;