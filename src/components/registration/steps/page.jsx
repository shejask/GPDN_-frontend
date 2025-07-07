"use client";
import React from "react";
import { Steps } from "antd";

const Step = ({ current }) => (
  <div>
    <div className="hidden md:flex">
      <Steps
        current={current}
        items={[
          {
            title: "Personal Information",
          },
          {
            title: "Professional Background",
          },
          {
            title: "Palliative Care Profile",
          },
        ]}
      />
    </div>

    <div className="flex md:hidden">
      <Steps
        current={current}
        type="inline"
        direction="vertical"
        items={[
          {
            title: "Personal Information",
          },
          {
            title: "Professional Background",
          },
          {
            title: "Palliative Care Profile",
          },
        ]}
      />
    </div>
  </div>
);

export default Step;
