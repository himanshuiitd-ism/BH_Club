// import React, { useState, useEffect, useRef } from "react";

// const AddReaction = ({ reactions = [] }) => {
//   const [visibleReactions, setVisibleReactions] = useState([]);
//   const [showEllipsis, setShowEllipsis] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const containerRef = useRef(null);
//   const dropdownRef = useRef(null);

//   //Count reactions and sort by frequency (descending)
//   const getReactionCounts = (reactionArray) => {
//     const counts = {};
//     reactionArray.forEach((reaction) => {
//       counts[reaction] = (counts[reaction] || 0) + 1;
//     });
//     return Object.entries(counts)
//       .sort((a, b) => b[1] - a[1])
//       .map(([emoji, count]) => ({ emoji, count }));
//   };

//   const reactionCounts = getReactionCounts(reactions);

//   useEffect(() => {
//     if (!containerRef.current || reactionCounts.length === 0) {
//       setVisibleReactions(reactionCounts);
//       setShowEllipsis(false);
//       return;
//     }

//     const container = containerRef.current;
//     const containerWidth = container.offsetWidth - 40;//for dropdown button width
//   });
//   return (
//     <div className="reaction-container">
//       <div className="reaction-box">
//         <div className="reaction-content">
//           <div className="reaction-list">
//             {visibleReactions.map(({ emoji, count }, index) => (
//               <span key={`${emoji}-${index}`} className="reaction-item">
//                 {emoji}/{count}
//               </span>
//             ))}
//             {showEllipsis && <span className="reaction-ellipsis">...</span>}
//           </div>
//           {reactions.length > 0 && (
//             <button
//               onClick={() => setShowDropdown(!showDropdown)}
//               className="dropdown-button"
//               aria-label="show all reactions"
//             >
//               {" "}
//               <ChevronIcon rotated={showDropdown} />
//             </button>
//           )}
//         </div>
//       </div>
//       {/* DropDown part */}
//       {showDropdown && (
//         <div className="dropdown-panel">
//           <div className="dropdown-content">
//             <div className="dropdown-header">All Reactions</div>
//             <div className="dropdown-reactions"></div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddReaction;
