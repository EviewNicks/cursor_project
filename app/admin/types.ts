export type ApiKey = {
  id: string;
  name: string;
  key: string;
  status: "active" | "inactive";
  createdAt: string;
  type: "dev" | "prod";
  usage: number;
  monthlyLimit: number;
};

export type ApiKeyFormData = {
  name: string;
  status: "active" | "inactive";
  type: "dev" | "prod";
};
