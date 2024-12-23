import twilio from 'twilio';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Initialize Twilio client with your account SID and auth token
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

export const sendSMS = async (phoneNumber) => {
    try {
        const phoneNumberObj = parsePhoneNumberFromString(phoneNumber, 'IN');
        console.log(phoneNumberObj ? phoneNumberObj.format('E.164') : 'Invalid phone number');

        if (!phoneNumberObj || !phoneNumberObj.isValid()) {
            throw new Error('Invalid phone number');
        }
        const formattedNumber = phoneNumberObj.format('E.164');
        
        // Send the OTP
        const verification = await client.verify.v2.services(serviceSid)
          .verifications
          .create({ to: formattedNumber, channel: 'sms' });
    
        console.log('OTP sent:', verification.sid);
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
};
