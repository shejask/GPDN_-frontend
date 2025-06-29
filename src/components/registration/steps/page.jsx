"use client"
import React from 'react';
import { Steps } from 'antd';

const Step = ({ current }) => (
  <Steps
    current={current}
    items={[
      {
        title: 'Personal Information',
      },
      {
        title: 'Professional Background',
      },
      {
        title: 'Palliative Care Profile',
      },
    ]}
  />
);

export default Step;