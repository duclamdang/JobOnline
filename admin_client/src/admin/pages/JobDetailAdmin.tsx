import { useParams } from "react-router-dom";
import JobEditor from "@admin/components/JobEditor";

export default function JobDetail() {
  const { id } = useParams();
  return <JobEditor mode="edit" jobId={Number(id)} />;
}
