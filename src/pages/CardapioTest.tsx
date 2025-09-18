"use client"
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";

const CardapioTest = () => {
  const [test, setTest] = useState(false);

  const filteredData = [1,2,3]
    .map(x => x * 2)
    .filter(x => x > 0);

  return (
    <Layout>
      <div className="space-y-6">
        <h1>Cardapio Test</h1>
        <p>This is a test</p>
      </div>
    </Layout>
  );
};

export default CardapioTest;