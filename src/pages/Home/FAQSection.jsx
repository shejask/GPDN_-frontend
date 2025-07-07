"use client";
import { faqData } from "@/app/assets/assets";
import React, { useState } from "react";
import { FaChevronRight } from "react-icons/fa6";
import { FaChevronDown } from "react-icons/fa6";
import { motion } from "framer-motion";
import Accordion from "@mui/material/Accordion";
import AccordionSummary, { accordionSummaryClasses } from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import styled from "styled-components";


const FAQSection = () => {
  const [activeFaq, setActiveFaq] = useState(1);
  const [expanded, setExpanded] = useState(null); // Track expanded index

const handleAccordionChange = (index) => (event, isExpanded) => {
  setExpanded(isExpanded ? index : null);
};


  return (
    <section className="w-full h-auto  flex justify-center items-center pt-5 lg:pt-16 pb-10 lg:pb-24">
      <div className="w-full h-full  flex flex-col gap-12">
        <h1 className="text-[2rem] md:text-[2.5rem] xl:text-[4rem] text-secondary font-semibold leading-[1.15]">
          Frequently Asked <br />
          Questions
        </h1>
        <div className="h-full w-full  flex flex-col gap-3">
          {/* {faqData.map((data, index) => (
            <div
            onClick={() => {
              if (activeFaq == index + 1) {
                setActiveFaq(0);
              } else {
                setActiveFaq(index + 1);
              }
            }}
              key={index}
              className={`w-full h-auto cursor-pointer rounded-lg flex flex-col gap-3 p-5 lg:p-8 ${
                activeFaq == index + 1 ? "shadow-faqActive" : "shadow-faqNormal"
              }`}
            >
              <div  className="flex items-center justify-between">
                <h2 className="text-[#252525] font-medium font-poppins text-sm md:text-[1rem] lg:text-[1.4rem]">
                  {data.q}
                </h2>
               <div className="flex items-center justify-center">
               <div
                  
                  className={`${
                    activeFaq == index + 1 ? "bg-secondary" : "bg-white"
                  } cursor-pointer rounded-full shadow-faqRound w-10 h-10 flex items-center justify-center`}
                >
                  {activeFaq == index + 1 ? (
                    <FaChevronDown className="text-white" />
                  ) : (
                    <FaChevronRight className="text-secondary" />
                  )}
                </div>
               </div>
              </div>
              <motion.p
                initial={{ height: 0 }}
                animate={
                  activeFaq === index + 1 ? { height: "auto" } : { height: 0 }
                }
                transition={{
                  duration: 0.5,
                  ease: "easeIn",
                }}
                className={`text-tertiary text-[0.65rem] md:text-[0.8rem] lg:text-lg font-sans font-normal transition-all overflow-hidden`}
              >
                {data.a}
              </motion.p>
            </div>
          ))} */}

          <div className="flex flex-col gap-5">
          {faqData.map((data, index) => {
  const isExpanded = expanded === index;

  return (
    <Accordion
      key={index}
      expanded={isExpanded}
      onChange={handleAccordionChange(index)}
      sx={{
        gap: 2,
        boxShadow: isExpanded
          ? '0 5px 15px -3px rgba(3, 103, 165,0.3), 0 4px 6px -4px rgba(3, 103, 165,0.3)' // shadow-faqActive
          : '0 5px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // shadow-faqNormal
        transition: "box-shadow 0.3s ease",
        cursor: "pointer",
      borderColor:"white",
      borderRadius:"1rem",

      "&::before": {
      display: "none",
    },
      
      }}
      className={`w-full h-auto  cursor-pointer rounded-lg  p-5 lg:p-5 ${
        isExpanded ? "shadow-faqActive" : "shadow-faqNormal"
      }`}
    >
      <AccordionSummary
        expandIcon={
          <ArrowForwardIosSharpIcon
            className={`${isExpanded ? "bg-secondary text-white" : "bg-white text-secondary" } border-none rounded-full  p-1.5 transition-transform duration-300`}
            sx={{
              fontSize: '2rem',
              transform: isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)',
              boxShadow:' 0 3px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
            }}
          />
        }
        aria-controls={`panel${index}-content`}
        id={`panel${index}-header`}
      >
        <Typography
          sx={{
            fontSize: { xs: "1rem", md: "1.25rem", lg: "1.5rem" },
            fontWeight: 500,
            color: "#252525",
            borderColor:"white",
            borderRadius:"1rem",

          }}
          className="font-poppins"
          component="span"
        >
          {data.q}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{
        borderColor:"white"
      }} className="border-none">
        <Typography
          sx={{
            width: "60%",
            fontSize: { xs: "0.85rem", md: "1rem", lg: "1.125rem" },
            fontWeight: 400,
            fontFamily: "Poppins, sans-serif",
            borderRadius:"1rem",
          }}
          className="font-poppins text-tertiary"
        >
          {data.a}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
})}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
