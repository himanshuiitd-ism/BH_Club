// // useGetMultipleUserProfiles.js
// import { useEffect, useState } from "react";
// import axios from "axios";

// const useGetMultipleUserProfiles = (userIds) => {
//   const [profiles, setProfiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchMultipleProfiles = async () => {
//       if (!userIds || userIds.length === 0) {
//         setLoading(false);
//         setProfiles([]);
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         // Create promises for all user profile requests
//         const profilePromises = userIds.map((userId) =>
//           axios.get(`http://localhost:8001/api/v1/user/${userId}/profile`, {
//             withCredentials: true,
//           })
//         );

//         // Wait for all requests to complete (even if some fail)
//         const responses = await Promise.allSettled(profilePromises);

//         // Filter successful responses and extract user data
//         const successfulProfiles = responses
//           .filter((result, index) => {
//             if (result.status === "rejected") {
//               console.error(
//                 `Failed to fetch user ${userIds[index]}:`,
//                 result.reason
//               );
//               return false;
//             }
//             return result.value?.data?.success && result.value?.data?.data;
//           })
//           .map((result) => result.value.data.data);

//         setProfiles(successfulProfiles);
//       } catch (error) {
//         console.error("Error fetching multiple user profiles:", error);
//         setError(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMultipleProfiles();
//   }, [userIds?.join(",")]); // Dependency on userIds array (converted to string for comparison)

//   return { profiles, loading, error };
// };

// export default useGetMultipleUserProfiles;
