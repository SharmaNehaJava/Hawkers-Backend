import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendVerificationEmail = async (email, otp) => {
    const msg = {
        to: email, // recipient
        from: 'process.env.EMAIL_FROM', // sender
        subject: 'Verification Code',
        text: `Your verification code is ${otp}`,
        html: `<strong>Your verification code is ${otp}</strong>`,
    };
    try {
        await sgMail.send(msg);
        // console.log('Verification email sent');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};





