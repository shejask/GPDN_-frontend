"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Result, Spin, Alert, Form, Input } from 'antd';
import { activateAccount, requestActivationLink } from '../../api/user';
import Image from 'next/image';
import logo from '../../app/assets/registation/logo.png';

const AccountActivation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [activationStatus, setActivationStatus] = useState({
    success: false,
    message: '',
    error: false
  });
  const [requestForm] = Form.useForm();
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState({
    success: false,
    message: '',
    error: false
  });

  useEffect(() => {
    const activateUserAccount = async () => {
      try {
        const userId = searchParams.get('id');
        const token = searchParams.get('token');
        
        if (!userId || !token) {
          setActivationStatus({
            success: false,
            error: true,
            message: 'Invalid activation link. Please request a new one.'
          });
          setLoading(false);
          return;
        }

        const response = await activateAccount(userId, token);
        
        if (response.error) {
          setActivationStatus({
            success: false,
            error: true,
            message: response.error.message || 'Failed to activate account. Please try again.'
          });
        } else if (response.data?.success) {
          setActivationStatus({
            success: true,
            error: false,
            message: 'Your account has been successfully activated!'
          });
        } else {
          setActivationStatus({
            success: false,
            error: true,
            message: 'Failed to activate account. Please try again.'
          });
        }
      } catch (error) {
        console.error('Error during activation:', error);
        setActivationStatus({
          success: false,
          error: true,
          message: 'An unexpected error occurred. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    // Only run activation if we have query parameters
    if (searchParams.has('id') && searchParams.has('token')) {
      activateUserAccount();
    } else {
      setLoading(false);
      setActivationStatus({
        success: false,
        error: true,
        message: 'Invalid activation link. Please request a new one below.'
      });
    }
  }, [searchParams]);

  const handleRequestNewLink = async (values) => {
    setRequestLoading(true);
    setRequestStatus({
      success: false,
      message: '',
      error: false
    });
    
    try {
      const response = await requestActivationLink(values.email);
      
      if (response.error) {
        setRequestStatus({
          success: false,
          error: true,
          message: response.error.message || 'Failed to request activation link. Please try again.'
        });
      } else if (response.data?.success) {
        setRequestStatus({
          success: true,
          error: false,
          message: 'New activation link has been sent to your email address.'
        });
        requestForm.resetFields();
      } else {
        setRequestStatus({
          success: false,
          error: true,
          message: 'Failed to request activation link. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error requesting activation link:', error);
      setRequestStatus({
        success: false,
        error: true,
        message: 'An unexpected error occurred. Please try again later.'
      });
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <Image
            src={logo}
            alt="GPDN Logo"
            width={120}
            height={120}
            className="mb-4"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Account Activation
          </h2>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Activating your account...</p>
          </div>
        ) : (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {activationStatus.success ? (
              <Result
                status="success"
                title="Account Activated Successfully!"
                subTitle={activationStatus.message}
                extra={[
                  <Button 
                    type="primary" 
                    key="login" 
                    onClick={() => router.push('/login')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Login
                  </Button>
                ]}
              />
            ) : (
              <div className="space-y-6">
                {activationStatus.error && (
                  <Alert
                    message="Activation Failed"
                    description={activationStatus.message}
                    type="error"
                    showIcon
                  />
                )}
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">
                    Request a new activation link
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your email address below to receive a new activation link.
                  </p>
                  
                  <Form
                    form={requestForm}
                    layout="vertical"
                    onFinish={handleRequestNewLink}
                    className="mt-4"
                  >
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        { required: true, message: 'Please enter your email address' },
                        { type: 'email', message: 'Please enter a valid email address' }
                      ]}
                    >
                      <Input size="large" placeholder="Enter your email address" />
                    </Form.Item>
                    
                    {requestStatus.success && (
                      <Alert
                        message="Success"
                        description={requestStatus.message}
                        type="success"
                        showIcon
                        className="mb-4"
                      />
                    )}
                    
                    {requestStatus.error && (
                      <Alert
                        message="Error"
                        description={requestStatus.message}
                        type="error"
                        showIcon
                        className="mb-4"
                      />
                    )}
                    
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={requestLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="large"
                      >
                        Request New Activation Link
                      </Button>
                    </Form.Item>
                  </Form>
                  
                  <div className="mt-4 text-center">
                    <Button 
                      type="link" 
                      onClick={() => router.push('/login')}
                      className="text-blue-600"
                    >
                      Back to Login
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountActivation;
