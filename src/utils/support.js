import axios from 'axios';

export const redirectToSupport = async () => {
    try {
        const response = await axios.get('/api/profile/support-email');
        const email = response.data.email;
        window.location.href = `mailto:${email}`;
    } catch (err) {
        console.error('Failed to get support email from server, using fallback:', err);
        window.location.href = 'mailto:mohankanthmaddina1784@gmail.com';
    }
};
