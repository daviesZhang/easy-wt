import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, TreeRepository } from 'typeorm';
import { IScriptCase, ScriptCase } from '@easy-wt/common';
import { RunConfigEntity, ScriptCaseEntity, StepEntity } from '../entitys';

@Injectable()
export class ScriptCaseService {
  logger = new Logger('ScriptCaseService');

  constructor(
    @InjectRepository(ScriptCaseEntity)
    private caseTreeRepository: TreeRepository<ScriptCase>,
    private dataSource: DataSource
  ) {}

  findAll(): Promise<IScriptCase[]> {
    return this.caseTreeRepository.find();
  }

  findById(id: number): Promise<IScriptCase> {
    return this.caseTreeRepository.findOne({
      where: { id: id },
      relations: ['runConfig'],
    });
  }

  /**
   * 查找所有非目录的下级
   * @param id
   */
  async findCasesById(id: number): Promise<IScriptCase[]> {
    const entity = new ScriptCaseEntity();
    return this.caseTreeRepository
      .createDescendantsQueryBuilder('category', 'categoryClosure', entity)
      .andWhere(`categoryClosure.id_ancestor= :id`, { id: id })
      .andWhere(`category.directory= :directory`, { directory: false })
      .leftJoinAndSelect('category.steps', 'steps')
      .getMany();
  }

  /**
   * 找到直接所有子节点
   * @param id 节点ID
   */
  async findDescendantsById(id: number): Promise<IScriptCase[]> {
    return await this.caseTreeRepository.findBy({ parentId: id });
  }

  /**
   * 找到他的所有下级树
   * @param id
   */
  findDescendantTreeById(id: number): Promise<IScriptCase> {
    const scriptCase = new ScriptCase();
    scriptCase.id = id;
    return this.caseTreeRepository.findDescendantsTree({ id } as ScriptCase, {
      relations: ['runConfig', 'steps'],
    });
  }

  async update(id: number, data: IScriptCase): Promise<string> {
    const next = await this.caseTreeRepository.update(id, data);
    return await next.raw;
  }

  async findTrees(): Promise<IScriptCase[]> {
    return await this.caseTreeRepository.findTrees();
  }

  findRoots(): Promise<IScriptCase[]> {
    return this.caseTreeRepository.findRoots();
  }

  /**
   * 根据ID找到用例,并且找到他的所有上级,返回tree
   * @param id
   * @param relations 需要关联的表
   */
  async findAncestorsTree(id: number): Promise<IScriptCase> {
    const categoryEntity = await this.caseTreeRepository.findOne({
      where: { id },
      relations: ['runConfig', 'steps'],
    });
    return this.caseTreeRepository.findAncestorsTree(categoryEntity, {
      relations: ['runConfig'],
    });
  }

  async copyCase(id: number) {
    const categoryEntity = await this.caseTreeRepository.findOne({
      where: { id },
      relations: ['runConfig', 'steps'],
    });
    const tree = await this.caseTreeRepository.findDescendantsTree(
      categoryEntity,
      { relations: ['runConfig', 'steps'] }
    );
    const saved = await this.dataSource.transaction(async (manager) => {
      async function saveRoot(node: ScriptCase, parentId: number) {
        const newNode = Object.assign({}, node, {
          id: null,
          parent: typeof parentId === 'number' ? { id: parentId } : null,
          parentId: parentId,
          children: [],
          steps: [],
          name: `${node.name} copy`,
        }) as ScriptCaseEntity;
        if (node.runConfig) {
          newNode.runConfig = Object.assign({}, node.runConfig, {
            id: null,
            caseId: null,
          });
        }
        const saved = await manager.save(ScriptCaseEntity, newNode);
        if (node.steps && node.steps.length) {
          const steps = node.steps.map((step) => {
            return Object.assign({}, step, { caseId: saved.id, id: null });
          });
          await manager.save(StepEntity, steps);
        }

        if (node.children && node.children.length) {
          await saveChildren(node.children, saved.id);
        }
        return saved;
      }

      async function saveChildren(
        nodes: ScriptCase[],
        parentId: number
      ): Promise<void> {
        for (const node of nodes) {
          await saveRoot(node, parentId);
        }
      }

      return await saveRoot(tree, tree.parentId);
    });
    return this.caseTreeRepository.findDescendantsTree(saved);
  }

  async saveTree(
    scriptCase: IScriptCase,
    parentId: number | null
  ): Promise<IScriptCase> {
    let scriptCases: Array<IScriptCase> = [];

    function getParent(scriptCase: IScriptCase) {
      scriptCases = [scriptCase, ...scriptCases];
      if (scriptCase.parent) {
        getParent(scriptCase.parent);
      }
    }

    function getChildren(scriptCaseList: IScriptCase[]) {
      for (const scriptCase of scriptCaseList) {
        scriptCases = [...scriptCases, scriptCase];
        if (scriptCase.children && scriptCase.children.length) {
          getChildren(scriptCase.children);
        }
      }
    }

    getParent(scriptCase);
    getChildren(scriptCase.children || []);
    const saved = await this.dataSource.transaction(async (manager) => {
      let root: ScriptCaseEntity;
      for (let i = 0; i < scriptCases.length; i++) {
        const parent = scriptCases[i];
        if (parentId !== null) {
          parent.parent = { id: parentId } as IScriptCase;
          parent.parentId = parentId;
        }
        const { steps, runConfig, children, ...other } = parent;
        const saved = await manager.save(ScriptCaseEntity, other);
        if (i === 0) {
          root = saved;
        }
        const id = saved.id;
        if (other.directory) {
          parentId = id;
        } else if (steps && steps.length) {
          steps.forEach((step) => Object.assign(step, { caseId: id }));
          await manager.save(StepEntity, steps);
        }

        if (runConfig) {
          runConfig.caseId = id;
          await manager.save(RunConfigEntity, runConfig);
        }
      }
      return root;
    });
    return this.caseTreeRepository.findDescendantsTree(saved);
  }

  save(scriptCase: IScriptCase): Promise<IScriptCase> {
    return this.caseTreeRepository.save(scriptCase);
  }

  /**
   * 返回被删除的ID列表
   * @param id
   */
  async delete(id: number): Promise<number[]> {
    const list = await this.caseTreeRepository.findDescendants({
      id,
    } as ScriptCase);
    await this.caseTreeRepository.delete({ id });
    return list.map((item) => item.id);
  }
}
