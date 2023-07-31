// Author: [Shubham Mishra]

import React, { useState, useContext, useEffect } from "react";
import { TextField, Grid, Button, Typography, Container } from "@mui/material";
import firebase from "firebase/compat/app";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../services/AuthContext';
import axios from 'axios';

const securityAPIEndpoint = 'https://km0vkw6jt0.execute-api.us-east-1.amazonaws.com/test/security';

const SecurityForm = () => {

  // State variables
  const navigate = useNavigate();

  const securityQuestions = [
    "What is your grandfather's first name?",
    "Which is your favourite subject?",
    "Where was your mother born?",
  ];

  const [securityAnswers, setAnswers] = useState(securityQuestions.map(() => ""));
  const [error, setError] = useState("");
  const { setIsSecondFactorAuthDone } = useContext(AuthContext);
  const [isNewUser, setIsNewUser] = useState(false);
  const { currentUser } = useContext(AuthContext);

  // Fetch user data from the server when the component mounts or user authentication changes
  useEffect(() => {
    if (currentUser) {
      checkIfuserExists(currentUser.uid)
    }
  }, [currentUser]);

  // Function to check if the user exists in the database
  const checkIfuserExists = async (userId) => {
    const requestData = {
      userId,
      functionName: "checkUserExists"
    };
    try {
      const response = await axios.post(securityAPIEndpoint, requestData);
      const result = response.data;
      const body = JSON.parse(result.body);
      console.log("result=", result);
      console.log("body=", body);
  
      if (result.statusCode === 200) {
        handleSetAuthDone();
        if (body.newUser) {
          setIsNewUser(true);
        } else{
          setIsNewUser(false);
        }
      }
    } catch (error) {
      console.error('Error invoking Lambda function:', error);
      setError('Some error occured. Please try again');
    }
  }

  // Function to set the second factor authentication as done
  const handleSetAuthDone = () => {
    localStorage.setItem('isSecondFactorAuthDone', JSON.stringify(true));
    setIsSecondFactorAuthDone(true);
  };

  // Function to handle changes in the security answer input fields
  const handleChange = (event, index) => {
    const { value } = event.target;
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[index] = value;
      return updatedAnswers;
    });
  };
  
  // Function to invoke the second factor authentication Lambda function
  const invokesecondFactorAuthLambda = async (userId) => {
    const requestData = {
      userId,
      securityAnswers: securityAnswers,
      functionName: "checkSecurityAnswers"
    };
  
    try {
      const response = await axios.post(securityAPIEndpoint, requestData);
      const result = response.data;
      const body = JSON.parse(result.body);
      console.log("result=", result);
      console.log("body=", body);
  
      if (result.statusCode === 200) {
        handleSetAuthDone();
        if (body.newUser) {
          navigate("/profile?isNewUser=true");
        } else{
          navigate("/welcomeTeamPage");
        }
      } else if (result.statusCode === 400){
          setError('Security answers do not match.');
        console.error('Lambda function execution failed');
        console.error(result);
      } else {
        setError('Some error occured. Please try again');
      }
    } catch (error) {
      console.error('Error invoking Lambda function:', error);
      setError('Some error occured. Please try again');
    }
  };
  
  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const userId = firebase.auth().currentUser.uid;  
    invokesecondFactorAuthLambda(userId);
  };
  

  return (
    <div>
      {/* Display different heading based on whether the user is new or existing */}
      {isNewUser ? (
        <Typography variant="h6" component="h3" align="center">
          You are a new user: Please answer these security questions.
        </Typography>
      ) : (
        <Typography variant="h6" component="h3" align="center">
          You are an existing user: Please answer the security questions.
        </Typography>
      )
      }
      <br></br>
      <Container>
      {/* Security Questions Form */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          {securityQuestions.map((question, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} md={6}>
                <TextField
                  label={`Security Question ${index + 1}`}
                  value={question}
                  variant="outlined"
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={`Answer ${index + 1}`}
                  value={securityAnswers[index]}
                  onChange={(event) => handleChange(event, index)}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            </Grid>
          )}
        </Grid>
      </form>
      </Container>
    </div>
  );
};

export default SecurityForm;
