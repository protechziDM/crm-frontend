import React from 'react';

function DateFormat({ dateString, format }) {
    if (!dateString) {
        return null;
    }

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return <span>Invalid Date</span>;
        }

        const day = date.getDate();
        let daySuffix = 'th';
        if (day === 1 || day === 21 || day === 31) {
            daySuffix = 'st';
        } else if (day === 2 || day === 22) {
            daySuffix = 'nd';
        } else if (day === 3 || day === 23) {
            daySuffix = 'rd';
        }

        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        };

        switch (format) {
            case 'date_time':
                const formattedDateParts = date.toLocaleDateString('en-US', options).split(', ');
                const monthYear = formattedDateParts[0].split(' ');
                const time = formattedDateParts[1];
                return <span>{`${day}${daySuffix} ${monthYear[0]} ${monthYear[1]}, ${time}`}</span>;

            case 'date_only':
                // Force date_only to remove time and prevent duplicate day
                const dateOnlyOptions = { year: 'numeric', month: 'short', day: 'numeric' };
                const dateOnlyString = date.toLocaleDateString('en-US', dateOnlyOptions);
                const dateOnlyParts = dateOnlyString.split(' '); // Split to get day, month and year
                return <span>{`${day}${daySuffix} ${dateOnlyParts[0]} ${dateOnlyParts[2]}`}</span>;

            case 'month_year':
                return <span>{date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>;

            case 'month':
                return <span>{date.toLocaleDateString('en-US', { month: 'short' })}</span>;

            case 'year':
                return <span>{date.toLocaleDateString('en-US', { year: 'numeric' })}</span>;

            default:
                // Default to date_time if no format is provided
                const defaultFormattedDateParts = date.toLocaleDateString('en-US', options).split(', ');
                const defaultMonthYear = defaultFormattedDateParts[0].split(' ');
                const defaultTime = defaultFormattedDateParts[1];
                return <span>{`${day}${daySuffix} ${defaultMonthYear[0]} ${defaultMonthYear[1]}, ${defaultTime}`}</span>;
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return <span>Invalid Date</span>;
    }
}

export default DateFormat;