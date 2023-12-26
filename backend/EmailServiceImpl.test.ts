// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import { createTransport } from 'nodemailer';
import { EmailMessage } from "../core/email/types/EmailMessage";
import { LogLevel } from "../core/types/LogLevel";
import { EmailServiceImpl } from "./EmailServiceImpl";

const mockTransporter = {
    sendMail: jest.fn()
};

jest.mock('nodemailer', () => ({
    createTransport: jest.fn()
}));

beforeAll(() => {
    EmailServiceImpl.setLogLevel(LogLevel.NONE);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('EmailServiceImpl', () => {
    let service: EmailServiceImpl;
    const defaultFrom = 'default@from.com';

    beforeEach(() => {
        service = EmailServiceImpl.create(defaultFrom);
        (createTransport as any).mockReturnValue(mockTransporter);
    });

    describe('setDefaultFrom', () => {
        it('should set default from address', () => {
            const from = 'test@from.com';
            service.setDefaultFrom(from);
            expect(service['_from']).toEqual(from);
        });
    });

    describe('initialize', () => {


        it('should create transporter with localhost and port 25 if config is empty', () => {
            service.initialize('');
            expect(createTransport).toHaveBeenCalledTimes(1);
            expect(createTransport).toHaveBeenCalledWith({
                host: 'localhost',
                port: 25,
                secure: false,
            });
        });

        // More tests for different configs would be written here
    });

    describe('sendEmailMessage', () => {

        const message: EmailMessage = {
            to: 'test@to.com',
            subject: 'Test Subject',
            content: 'Test Content',
        };

        beforeEach(() => {
            service.initialize('');
            expect(createTransport).toHaveBeenCalledTimes(1);
            expect(createTransport).toHaveBeenCalledWith({
                host: 'localhost',
                port: 25,
                secure: false,
            });
        });

        it('should throw error if from address is not set', async () => {
            service['_from'] = '';
            await expect(service.sendEmailMessage(message)).rejects.toThrow('"from" must be defined');
        });

        it('should send email using transporter', async () => {
            await service.sendEmailMessage(message);
            expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                from: defaultFrom,
                to: message.to,
                subject: message.subject,
                text: message.content,
                html: message.content,
            });
        });

        // More tests for different scenarios would be written here
    });

});
