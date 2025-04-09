const batchSubjectWiseTestModel = require("../models/adminModel/adminCoursesModel/adminAllClassesSubjectsDataModel/adminBatchTestModel");
const { directTestModel } = require("../models/adminModel/adminDirectTestModel.js/adminDirectTestModel");
// const directTestModel = require("../models/adminModel/adminDirectTestModel.js/adminDirectTestModel");
const directTestSubmitModel = require("../models/studentsModel/directTestSubmitModel");
const batchTestQuestionResponseModel = require("../models/studentsModel/studentBatchTestSubmitModel");

const fetchTestScoreboard = async (testId, userId) => {
  try {


    // Fetch the student test responses for the given testId and userId
    const studentTestResponse = await batchTestQuestionResponseModel
      .findOne({ testId, userId })
      .populate("responses.questionId");

    // If the student test response is not found, return null
    if (!studentTestResponse) {
      return {
        status: false,
        error: "No responses found for this test",
        statusCode: 404,
      };
    }

    // Get the test details (e.g., total marks, questions)
    const test = await batchSubjectWiseTestModel
      .findById(testId)
      .populate("questions");

    if (!test) {
      return { status: false, error: "Test not found", statusCode: 404 };
    }

    // Calculate the total score, correct answers, and other data
    const { totalMarks, questions } = test;
    const totalQuestions = questions.length;
    const marksPerQuestion = totalMarks / totalQuestions;

    let totalScore = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unattemptedQuestions = 0;
    let negativeMarks = 0;

    // Loop through each response to calculate score details
    const responseDetails = studentTestResponse.responses.map((response) => {
      const question = response.questionId;
      const correctOptionLetter = question.correctAnswer.split(":")[0].trim();

      const isCorrect = correctOptionLetter === response.selectedOption;
      const isAttempted = response.selectedOption !== "unattempted";

      if (isCorrect) {
        correctAnswers++;
        totalScore += marksPerQuestion;
      } else if (!isAttempted) {
        unattemptedQuestions++;
      } else {
        wrongAnswers++;
        negativeMarks += test.wrongAnswerDeduction;
      }

      return {
        questionText: question.questionText,
        options: question.options,
        selectedOption: response.selectedOption,
        isCorrect,
        explanation: question.explanation,
      };
    });

    // Apply the negative marks deduction
    totalScore -= negativeMarks;
    totalScore = Number(totalScore.toFixed(2));

    // Return the result as an object
    return {
      status: true,
      data: {
        correctAnswers,
        wrongAnswers,
        unattemptedQuestions,
        totalMarks,
        score: totalScore,
        negativeMarksApplied: negativeMarks,
        responses: responseDetails,
      },
    };
  } catch (error) {
    return {
      status: false,
      error: "An error occurred while fetching the test scoreboard",
      statusCode: 500,
    };
  }
};


// const fetchDirectTestScoreboard = async (testId, userId) => {
//   try {
//     // Fetch the student test responses for the given testId and userId
//     const studentTestResponse = await directTestSubmitModel.findOne({
//       directTestId: testId,
//       userId: userId,
//     });

//     // If the student test response is not found, return an error response
//     if (!studentTestResponse) {
//       return {
//         status: false,
//         error: "No responses found for this test",
//         statusCode: 404,
//       };
//     }

//     // Fetch the test details, including the questions array, and populate the question details
//     const test = await directTestModel.findById(testId).populate({
//       path: "questions._id", 
//     });

//     if (!test) {
//       return { status: false, error: "Test not found", statusCode: 404 };
//     }

//     // Extract test details
//     const { totalMarks, questions } = test;
//     const totalQuestions = questions.length;
//     const marksPerQuestion = totalMarks / totalQuestions;

//     // Initialize scoring details
//     let totalScore = 0;
//     let correctAnswers = 0;
//     let wrongAnswers = 0;
//     let unattemptedQuestions = 0;
//     let negativeMarks = 0;

//     // Calculate score based on responses
//     const responseDetails = studentTestResponse.responses.map((response) => {
//       // Find the corresponding question in the test by matching the _id
//       const question = questions.find(
//         (q) => q._id.toString() === response.questionId.toString()
//       );

//       if (!question) {
//         throw new Error(`Question with id ${response.questionId} not found in test`);
//       }

//       const correctOptionLetter = question.correctAnswer.split(":")[0].trim();
//       const isCorrect = correctOptionLetter === response.selectedOption;
//       const isAttempted = response.selectedOption !== "unattempted";

//       if (isCorrect) {
//         correctAnswers++;
//         totalScore += marksPerQuestion;
//       } else if (!isAttempted) {
//         unattemptedQuestions++;
//       } else {
//         wrongAnswers++;
//         negativeMarks += test.wrongAnswerDeduction;
//       }

//       return {
//         questionText: question.questionText,
//         options: question.options,
//         selectedOption: response.selectedOption,
//         isCorrect,
//         explanation: question.explanation,
//       };
//     });

//     // Finalize the total score with negative marking applied
//     totalScore -= negativeMarks;
//     totalScore = Number(totalScore.toFixed(2));

//     // Return the result as an object
//     return {
//       status: true,
//       data: {
//         correctAnswers,
//         wrongAnswers,
//         unattemptedQuestions,
//         totalMarks,
//         score: totalScore,
//         negativeMarksApplied: negativeMarks,
//         responses: responseDetails,
//       },
//     };
//   } catch (error) {
//     // Handle any errors during the process
//     console.error("Error in fetchDirectTestScoreboard:", error);
//     return {
//       status: false,
//       error: "An error occurred while fetching the test scoreboard",
//       statusCode: 500,
//     };
//   }
// };




// helperDirectTest.js

// Function to fetch all questions data based on directTestId
const fetchAllQuestionsData = async (directTestId) => {
  try {
    const test = await directTestModel.findOne({ "_id": directTestId }, { "questions": 1 });

    if (test && test.questions) {
      return test.questions;
    } else {
      return [];  
    }
  } catch (err) {
    throw new Error('Error fetching all question data: ' + err.message);
  }
};

// Function to generate the direct test scoreboard response
const getDirectTestScoreBoard = async (directTestId, userId) => {
  try {
    // Fetch score data from the database
    const scoreData = await directTestSubmitModel
      .findOne({ directTestId: directTestId, userId: userId })
      .populate("directTestId", "-questions -clsId -subjectTest -chapter -_id")
      .populate("userId", "fullName");

    if (!scoreData) {
      return {
        status: false,
        message: "No result details found.",
      };
    }

    // Fetch all question data
    const questionsData = await fetchAllQuestionsData(directTestId);

    // Map the responses to the corresponding question details
    const questionDetails = scoreData.responses.map((response) => {
      const questionData = questionsData.find(q => q._id.toString() === response.questionId.toString());

      if (questionData) {
        return {
          questionId: questionData._id,
          questionText: questionData.questionText,
          options: questionData.options.map(option => ({
            optionText: option.optionText,
            isCorrect: option.isCorrect,
          })),
          selectedOption: response.selectedOption,
          correctAnswer: questionData.correctAnswer,
          explanation: questionData.explanation,
          difficultyLevel: questionData.difficultyLevel,
          isCorrect: response.isCorrect,
          isAttempted: response.isAttempted,
        };
      }
    });

    // Return the structured response
    return {
      status: true,
      message: "Direct scoreboard fetched successfully.",
      data: {
        correctAnswers: scoreData.correctAnswers,
        wrongAnswers: scoreData.wrongAnswers,
        unattemptedQuestions: scoreData.unattemptedQuestions,
        totalMarks: scoreData.totalMarks,
        score: scoreData.score,
        negativeMarksApplied: scoreData.negativeMarksApplied,
        createdAt: scoreData.createdAt,
        updatedAt: scoreData.updatedAt,
        testDetails: {
          testCount: scoreData.directTestId.testCount,
          name: scoreData.directTestId.name,
          description: scoreData.directTestId.description,
          totalMarks: scoreData.directTestId.totalMarks,
          duration: scoreData.directTestId.duration,
          wrongAnswerDeduction: scoreData.directTestId.wrongAnswerDeduction,
          unattemptedDeduction: scoreData.directTestId.unattemptedDeduction,
          createdAt: scoreData.directTestId.createdAt,
        },
        studentData: {
          name: scoreData.userId.fullName,
          email: scoreData.userId.email || "",
        },
        responses: questionDetails.filter(item => item !== undefined),
      },
    };

  } catch (err) {
    return {
      status: false,
      message: `Error fetching data: ${err.message}`,
    };
  }
};





module.exports = { fetchTestScoreboard, getDirectTestScoreBoard };
