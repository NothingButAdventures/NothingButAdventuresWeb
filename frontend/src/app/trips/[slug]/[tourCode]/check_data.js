
const apiBase = "http://localhost:5000/api/v1"; // Assuming standard port
async function checkTour() {
  try {
    const res = await fetch(`${apiBase}/tours/india-adventure`);
    const data = await res.json();
    console.log("Tour Activities:", JSON.stringify(data.data.tour.itinerary.flatMap(d => d.activities), null, 2));
    console.log("Optional Activities:", JSON.stringify(data.data.tour.itinerary.flatMap(d => d.optionalActivities), null, 2));
  } catch (e) {
    console.error(e);
  }
}
checkTour();
