import { MOCK_PROJECTS } from "../MockProjectsOLD";
import { mockProject, mockProjects } from "../mockProjects";
import { Project } from "../Project";

const projectAPI = {
	get(page = 1, limit = 20) {
		return Promise.resolve(mockProjects);
	},
	find(id: number) {
		return Promise.resolve(
			mockProjects.find((project) => project.id === id)
		);
	},
	put(project: Project) {
		return Promise.resolve(project);
	},
};

export { projectAPI };
