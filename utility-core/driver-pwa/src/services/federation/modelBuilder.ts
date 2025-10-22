/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export type CitizenModel = {
    id: string;
    author: string;
    variables: string[];
    equations: string[];
    assumptions: string[];
  };
  
  let models: CitizenModel[] = [];
  
  export function createModel(author: string, variables: string[], equations: string[], assumptions: string[]) {
    const model: CitizenModel = {
      id: Math.random().toString(36).slice(2),
      author,
      variables,
      equations,
      assumptions,
    };
    models.push(model);
    return model;
  }
  
  export function listModels() {
    return models;
  }